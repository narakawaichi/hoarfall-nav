import { NextRequest, NextResponse } from 'next/server';
import { getComments, addComment } from '@/lib/commentStore';
import { verifyCaptcha } from '@/lib/commentCaptcha';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_CONTENT = 500;

// 简易频率限制：内存版（进程级），按 IP 每分钟最多 5 条
const rateMap = new Map<string, number[]>();
const RATE_LIMIT_PER_MIN = 5;

function isLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (rateMap.get(ip) || []).filter((t) => now - t < 60_000);
  if (arr.length >= RATE_LIMIT_PER_MIN) {
    rateMap.set(ip, arr);
    return true;
  }
  arr.push(now);
  rateMap.set(ip, arr);
  return false;
}

function cleanPage(page: unknown): string {
  const s = typeof page === 'string' ? page.trim() : '';
  if (!s || s.length > 200) return '';
  // 防 Prototype 污染等异常 key
  if (s === '__proto__' || s === 'constructor' || s === 'prototype') return '';
  return s;
}

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'local';
}

// 读取某页评论（不含邮箱全文，做脱敏）
export async function GET(req: NextRequest) {
  const page = cleanPage(req.nextUrl.searchParams.get('page'));
  if (!page) return NextResponse.json({ ok: false, error: 'page 参数缺失' }, { status: 400 });

  const list = (await getComments(page))
    .slice()
    .sort((a, b) => a.createdAt - b.createdAt)
    .map((c) => ({
      id: c.id,
      nickname: c.nickname,
      emailMasked: maskEmail(c.email),
      content: c.content,
      createdAt: c.createdAt,
    }));
  return NextResponse.json({ ok: true, comments: list });
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: '请求体不是合法 JSON' }, { status: 400 });
  }

  const ip = getClientIp(req);
  if (isLimited(ip)) {
    return NextResponse.json({ ok: false, error: '留言太频繁啦，休息一下再试喵' }, { status: 429 });
  }

  const email = typeof body.email === 'string' ? body.email.trim() : '';
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: '邮箱格式不正确' }, { status: 400 });
  }

  const rawContent = typeof body.content === 'string' ? body.content : '';
  const content = rawContent
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim();
  if (!content) return NextResponse.json({ ok: false, error: '留言内容不能为空' }, { status: 400 });
  if (content.length > MAX_CONTENT) {
    return NextResponse.json({ ok: false, error: `留言最长 ${MAX_CONTENT} 字` }, { status: 400 });
  }

  // 算术验证码
  if (!verifyCaptcha(body.token, body.answer)) {
    return NextResponse.json({ ok: false, error: '验证码不对，再算算看？' }, { status: 400 });
  }

  const page = cleanPage(body.page);
  if (!page) return NextResponse.json({ ok: false, error: 'page 参数缺失' }, { status: 400 });

  // 昵称可选：缺省用邮箱前缀
  const rawNick = typeof body.nickname === 'string' ? body.nickname.trim().slice(0, 20) : '';
  const nickname = rawNick || email.split('@')[0].slice(0, 20);

  const item = await addComment(page, { nickname, email, content });
  return NextResponse.json({
    ok: true,
    comment: { id: item.id, nickname: item.nickname, emailMasked: maskEmail(item.email), content: item.content, createdAt: item.createdAt },
  });
}

function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  if (!domain) return email;
  const head = name.length <= 2 ? name : name.slice(0, 2);
  return `${head}***@${domain}`;
}
