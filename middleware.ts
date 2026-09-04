import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 默认 Pages 域名 → 正式域名 301（避免默认域被直接访问/收录）
// 仅当 host 命中 Pages 分配的默认域(.edgeone.cool)才跳转，正式域/本地不受影响，不会循环
const DEFAULT_PAGES_HOST = 'hoarfall-nav-er4nxjaq.edgeone.cool';
const CANONICAL_HOST = 'nav.hoarfall.cn';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';

  if (host.includes(DEFAULT_PAGES_HOST)) {
    const url = request.nextUrl.clone();
    url.protocol = 'https:';
    url.host = CANONICAL_HOST;
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logos/).*)'],
};
