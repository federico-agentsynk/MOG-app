import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

// GET /api/auth/whoop  — kicks off the OAuth 2.0 PKCE-less code flow
export async function GET() {
  if (!process.env.WHOOP_CLIENT_ID || !process.env.WHOOP_REDIRECT_URI) {
    return new NextResponse('WHOOP env vars not configured', { status: 500 });
  }

  const state = randomUUID();

  const params = new URLSearchParams({
    client_id:     process.env.WHOOP_CLIENT_ID,
    redirect_uri:  process.env.WHOOP_REDIRECT_URI,
    response_type: 'code',
    scope:         'offline read:recovery read:sleep read:body_measurement',
    state,
  });

  const authUrl = `https://api.prod.whoop.com/oauth/oauth2/auth?${params}`;

  const response = NextResponse.redirect(authUrl);
  // Store state in a short-lived httpOnly cookie for CSRF protection
  response.cookies.set('whoop_state', state, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   600, // 10 minutes
    path:     '/',
  });

  return response;
}
