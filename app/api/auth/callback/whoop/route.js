import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { saveTokens } from '@/lib/whoop';

const TOKEN_URL = 'https://api.prod.whoop.com/oauth/oauth2/token';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code  = searchParams.get('code');
  const state = searchParams.get('state');
  const oauthError = searchParams.get('error');

  // ── CSRF state check ──────────────────────────────────────────────────────
  const storedState = request.cookies.get('whoop_state')?.value;
  if (oauthError || !code || !state || state !== storedState) {
    const desc = searchParams.get('error_description') ?? oauthError ?? 'state mismatch';
    console.error('[WHOOP callback] rejected:', desc);
    return NextResponse.redirect(new URL('/settings?whoop=error', request.url));
  }

  // ── Exchange code for tokens ──────────────────────────────────────────────
  const body = new URLSearchParams({
    grant_type:    'authorization_code',
    code,
    redirect_uri:  process.env.WHOOP_REDIRECT_URI,
    client_id:     process.env.WHOOP_CLIENT_ID,
    client_secret: process.env.WHOOP_CLIENT_SECRET,
  });

  const tokenRes = await fetch(TOKEN_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    body.toString(),
  });

  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    console.error('[WHOOP token exchange] failed:', text);
    return NextResponse.redirect(new URL('/settings?whoop=error', request.url));
  }

  const tokens = await tokenRes.json();

  // ── Persist tokens linked to this device/user ─────────────────────────────
  const userId = request.cookies.get('mog_user_id')?.value ?? randomUUID();

  try {
    await saveTokens(userId, tokens);
  } catch (err) {
    console.error('[WHOOP save tokens]', err.message);
    return NextResponse.redirect(new URL('/settings?whoop=error', request.url));
  }

  // ── Redirect back to settings with success flag ───────────────────────────
  const response = NextResponse.redirect(new URL('/settings?whoop=connected', request.url));

  response.cookies.set('mog_user_id', userId, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   60 * 60 * 24 * 365, // 1 year
    path:     '/',
  });
  response.cookies.delete('whoop_state');

  return response;
}
