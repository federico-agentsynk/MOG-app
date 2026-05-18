import { supabase } from './supabase';

const TOKEN_URL = 'https://api.prod.whoop.com/oauth/oauth2/token';
const API_BASE  = 'https://api.prod.whoop.com/developer';

// ── Token Management ─────────────────────────────────────────────────────────

export async function saveTokens(userId, { access_token, refresh_token, expires_in }) {
  const expiresAt = new Date(Date.now() + expires_in * 1000).toISOString();
  const { error } = await supabase
    .from('whoop_tokens')
    .upsert(
      { user_id: userId, access_token, refresh_token, expires_at: expiresAt, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' },
    );
  if (error) throw new Error(`Supabase upsert failed: ${error.message}`);
}

async function doRefresh(userId, refreshToken) {
  const body = new URLSearchParams({
    grant_type:    'refresh_token',
    refresh_token: refreshToken,
    client_id:     process.env.WHOOP_CLIENT_ID,
    client_secret: process.env.WHOOP_CLIENT_SECRET,
  });

  const res = await fetch(TOKEN_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WHOOP refresh failed (${res.status}): ${text}`);
  }

  const tokens = await res.json();
  await saveTokens(userId, {
    access_token:  tokens.access_token,
    refresh_token: tokens.refresh_token ?? refreshToken,
    expires_in:    tokens.expires_in,
  });
  return tokens.access_token;
}

export async function getValidToken(userId) {
  const { data, error } = await supabase
    .from('whoop_tokens')
    .select('access_token, refresh_token, expires_at')
    .eq('user_id', userId)
    .single();

  if (error || !data) throw new Error('WHOOP not connected for this user');

  // Refresh proactively 5 minutes before expiry
  const bufferMs  = 5 * 60 * 1000;
  const expiresAt = new Date(data.expires_at).getTime();
  if (Date.now() >= expiresAt - bufferMs) {
    return doRefresh(userId, data.refresh_token);
  }

  return data.access_token;
}

// ── Data Fetching ─────────────────────────────────────────────────────────────

async function whoopFetch(userId, path) {
  const token = await getValidToken(userId);
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    // cache up to 5 min on the server so rapid page loads don't burn rate-limit
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`WHOOP ${path} failed (${res.status})`);
  return res.json();
}

export async function fetchRecovery(userId) {
  const { records } = await whoopFetch(userId, '/v1/recovery?limit=1');
  return records?.[0] ?? null;
}

export async function fetchSleep(userId) {
  const { records } = await whoopFetch(userId, '/v1/activity/sleep?limit=2');
  // Prefer the most recent full sleep (non-nap)
  return records?.find((r) => !r.nap) ?? records?.[0] ?? null;
}
