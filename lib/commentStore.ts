// 评论存储层 —— 双模式：
// 1) 配置了 COS_SECRET_ID/COS_SECRET_KEY/COS_BUCKET/COS_REGION → COS(腾讯云对象存储)，每页一个 JSON 对象
// 2) 未配置 → 回落本地 JSON 文件（本地开发/预览用）
// 业务代码只依赖 getComments/addComment，切换存储不动上层。

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export type CommentItem = {
  id: string;
  nickname: string;
  email: string;
  content: string;
  createdAt: number; // unix ms
};

const LOCAL_DB_PATH = path.join(process.cwd(), 'data', 'comments.json');

type CosEnv = { secretId: string; secretKey: string; bucket: string; region: string };

function getCosEnv(): CosEnv | null {
  const secretId = process.env.COS_SECRET_ID;
  const secretKey = process.env.COS_SECRET_KEY;
  const bucket = process.env.COS_BUCKET;
  const region = process.env.COS_REGION;
  if (!secretId || !secretKey || !bucket || !region) return null;
  return { secretId, secretKey, bucket, region };
}

// 官方 SDK 惰性加载（仅在有 COS 环境变量时才 require，避免污染无 COS 场景）
type CosSdk = {
  getObject: (p: any, cb: (e: any, d: any) => void) => void;
  putObject: (p: any, cb: (e: any, d: any) => void) => void;
};
let cosSdk: CosSdk | null = null;

function ensureCosSdk(env: CosEnv): CosSdk {
  if (!cosSdk) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const COS = require('cos-nodejs-sdk-v5');
    cosSdk = new COS({ SecretId: env.secretId, SecretKey: env.secretKey });
  }
  return cosSdk;
}

function pageToCosKey(page: string): string {
  const hash = crypto.createHash('sha1').update(page).digest('hex');
  return `comments/${hash}.json`;
}

function sdkGetJson(cos: CosSdk, env: CosEnv, key: string): Promise<CommentItem[] | null> {
  return new Promise((resolve) => {
    cos.getObject(
      { Bucket: env.bucket, Region: env.region, Key: key },
      (err, data) => {
        if (err) {
          if (String(err?.code || '').includes('NoSuchKey') || String(err?.statusCode) === '404') {
            resolve(null);
          } else {
            console.error('[comments][cos] getObject 失败:', JSON.stringify(err));
            resolve(null);
          }
          return;
        }
        try {
          const parsed = JSON.parse(data.Body?.toString() || '');
          if (Array.isArray(parsed.items)) resolve(parsed.items);
          else resolve([]);
        } catch {
          resolve([]);
        }
      },
    );
  });
}

function sdkPutJson(
  cos: CosSdk,
  env: CosEnv,
  key: string,
  payload: { page: string; items: CommentItem[] },
): Promise<boolean> {
  return new Promise((resolve) => {
    cos.putObject(
      { Bucket: env.bucket, Region: env.region, Key: key, Body: JSON.stringify(payload) },
      (err) => {
        if (err) {
          console.error('[comments][cos] putObject 失败:', JSON.stringify(err));
          resolve(false);
        } else {
          resolve(true);
        }
      },
    );
  });
}

// ---------- 本地 JSON 文件（fallback） ----------
function readLocalPage(page: string): CommentItem[] {
  try {
    if (!fs.existsSync(LOCAL_DB_PATH)) return [];
    const db = JSON.parse(fs.readFileSync(LOCAL_DB_PATH, 'utf-8'));
    if (!db || !Array.isArray(db.pages)) return [];
    const found = db.pages.find((p: any) => p.page === page);
    return found ? found.items : [];
  } catch {
    return [];
  }
}

function writeLocalPage(page: string, items: CommentItem[]) {
  try {
    let db: any = { version: 1, pages: [] };
    if (fs.existsSync(LOCAL_DB_PATH)) {
      try {
        db = JSON.parse(fs.readFileSync(LOCAL_DB_PATH, 'utf-8'));
      } catch {
        db = { version: 1, pages: [] };
      }
    }
    const idx = db.pages.findIndex((p: any) => p.page === page);
    if (idx >= 0) db.pages[idx] = { page, items };
    else db.pages.push({ page, items });
    fs.mkdirSync(path.dirname(LOCAL_DB_PATH), { recursive: true });
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (e) {
    console.error('[comments] 写入本地存储失败:', e);
  }
}

// ---------- 对外 API ----------
export async function getComments(page: string): Promise<CommentItem[]> {
  const env = getCosEnv();
  if (env) {
    const cos = ensureCosSdk(env);
    const items = await sdkGetJson(cos, env, pageToCosKey(page));
    return items ?? [];
  }
  return readLocalPage(page);
}

export async function addComment(
  page: string,
  data: { nickname: string; email: string; content: string },
): Promise<CommentItem> {
  const item: CommentItem = {
    id: `${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}`,
    nickname: data.nickname,
    email: data.email,
    content: data.content,
    createdAt: Date.now(),
  };

  const env = getCosEnv();
  if (env) {
    const cos = ensureCosSdk(env);
    const key = pageToCosKey(page);
    const existing = (await sdkGetJson(cos, env, key)) ?? [];
    existing.push(item);
    if (existing.length > 200) existing.splice(0, existing.length - 200);
    await sdkPutJson(cos, env, key, { page, items: existing });
    return item;
  }

  const items = readLocalPage(page);
  items.push(item);
  if (items.length > 200) items.splice(0, items.length - 200);
  writeLocalPage(page, items);
  return item;
}
