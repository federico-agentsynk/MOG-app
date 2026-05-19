import { randomUUID } from 'crypto';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 365,
  path: '/',
};

export function readUserId(req) {
  return req.cookies.get('mog_user_id')?.value ?? null;
}

export function resolveUserId(req) {
  const existing = req.cookies.get('mog_user_id')?.value;
  if (existing) {
    return { userId: existing, stamp: (res) => res };
  }
  const newId = randomUUID();
  return {
    userId: newId,
    stamp: (res) => {
      res.cookies.set('mog_user_id', newId, COOKIE_OPTS);
      return res;
    },
  };
}
