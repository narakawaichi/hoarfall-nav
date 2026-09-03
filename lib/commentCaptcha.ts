// 算术验证码（无状态 HMAC 版）：
// - 生成时返回 { token, expr }，答案不落任何内存，服务端重启/多实例也不丢
// - 校验时凭 token 还原算式再算答案，天然防篡改
import crypto from 'crypto';

const SECRET =
  process.env.COMMENT_CAPTCHA_SECRET || 'hoarfall-local-comment-captcha-v1';
const TTL = 5 * 60 * 1000; // 5 分钟有效

function b64url(buf: Buffer | string): string {
  return Buffer.from(buf).toString('base64url');
}

function b64urlDecode(str: string): string {
  return Buffer.from(str, 'base64url').toString('utf-8');
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
}

export type CaptchaChallenge = { token: string; expr: string };

export function generateCaptcha(): CaptchaChallenge {
  const a = 1 + Math.floor(Math.random() * 9);
  const b = 1 + Math.floor(Math.random() * 9);
  const expr = `${a} + ${b}`;
  const payload = JSON.stringify({ expr, exp: Date.now() + TTL });
  const payloadB64 = b64url(payload);
  const token = `${payloadB64}.${sign(payloadB64)}`;
  return { token, expr };
}

export function verifyCaptcha(token: string | null | undefined, answer: unknown): boolean {
  if (!token || typeof token !== 'string' || !token.includes('.')) return false;
  const [raw, sig] = token.split('.');
  if (!raw || !sig) return false;
  // 防篡改校验
  const expectedSig = sign(raw);
  const sigA = Buffer.from(expectedSig);
  const sigB = Buffer.from(sig);
  if (sigA.length !== sigB.length || !crypto.timingSafeEqual(sigA, sigB)) return false;

  let payload: { expr?: string; exp?: number };
  try {
    payload = JSON.parse(b64urlDecode(raw));
  } catch {
    return false;
  }
  if (!payload.expr || typeof payload.exp !== 'number') return false;
  if (Date.now() > payload.exp) return false; // 过期

  // 只允许 "x + y" 这种加法，暴力解析
  const m = /^(\d+)\s*\+\s*(\d+)$/.exec(payload.expr.trim());
  if (!m) return false;
  const expected = parseInt(m[1], 10) + parseInt(m[2], 10);
  const got = typeof answer === 'number' ? answer : parseInt(String(answer), 10);
  return got === expected;
}
