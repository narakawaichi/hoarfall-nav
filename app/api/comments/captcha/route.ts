import { NextResponse } from 'next/server';
import { generateCaptcha } from '@/lib/commentCaptcha';

export async function GET() {
  const { token, expr } = generateCaptcha();
  return NextResponse.json({ token, expr });
}
