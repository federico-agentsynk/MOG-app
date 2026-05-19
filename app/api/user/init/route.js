import { NextResponse } from 'next/server';
import { resolveUserId } from '@/lib/apiUser';

export async function GET(req) {
  const { stamp } = resolveUserId(req);
  return stamp(NextResponse.json({ ok: true }));
}
