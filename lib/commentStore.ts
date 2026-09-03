// 评论存储层 —— 当前用本地 JSON 文件（data/comments.json）持久化。
// 注意：存储层已隔离，以后迁移到 MySQL / D1 / R2 时只需改本文件，不动 API 与 UI。

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

type CommentPage = { page: string; items: CommentItem[] };
type CommentDB = { version: number; pages: CommentPage[] };

const DB_PATH = path.join(process.cwd(), 'data', 'comments.json');

function loadDB(): CommentDB {
  try {
    if (!fs.existsSync(DB_PATH)) return { version: 1, pages: [] };
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.pages)) return parsed as CommentDB;
    return { version: 1, pages: [] };
  } catch {
    return { version: 1, pages: [] };
  }
}

function saveDB(db: CommentDB) {
  try {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (e) {
    console.error('[comments] 写入评论存储失败:', e);
  }
}

export function getComments(page: string): CommentItem[] {
  const db = loadDB();
  const found = db.pages.find((p) => p.page === page);
  return found ? found.items : [];
}

export function addComment(
  page: string,
  data: { nickname: string; email: string; content: string },
): CommentItem {
  const db = loadDB();
  let entry = db.pages.find((p) => p.page === page);
  if (!entry) {
    entry = { page, items: [] };
    db.pages.push(entry);
  }
  const item: CommentItem = {
    id: `${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}`,
    nickname: data.nickname,
    email: data.email,
    content: data.content,
    createdAt: Date.now(),
  };
  entry.items.push(item);
  // 只保留最近 200 条，防止文件无限膨胀
  if (entry.items.length > 200) {
    entry.items = entry.items.slice(-200);
  }
  saveDB(db);
  return item;
}
