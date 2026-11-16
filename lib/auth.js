import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { load } from './db';

const COOKIE = 'yj_session';

export const hashPassword = (pw) => bcrypt.hash(pw, 10);
export const verifyPassword = (pw, hash) => bcrypt.compare(pw, hash || '');

const sign = (data, secret) => crypto.createHmac('sha256', secret).update(data).digest('base64url');

const safeEqual = (a, b) => {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
};

export async function createSession(userId) {
  const db = await load();
  const exp = Date.now() + 1000 * 60 * 60 * 24 * 30;
  const payload = `${userId}.${exp}`;
  const tok = `v1.${payload}.${sign(payload, db.secret)}`;
  cookies().set(COOKIE, tok, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30
  });
}

export async function currentUser() {
  const raw = cookies().get(COOKIE)?.value;
  if (!raw) return null;
  const parts = raw.split('.');
  if (parts.length !== 4 || parts[0] !== 'v1') return null;
  const [, userId, exp, sig] = parts;
  if (!userId || !exp || Number(exp) < Date.now()) return null;
  const db = await load();
  if (!safeEqual(sig, sign(`${userId}.${exp}`, db.secret))) return null;
  const user = db.users.find((u) => u.id === userId);
  if (!user || user.banned) return null;
  return user;
}

export function clearSession() {
  cookies().delete(COOKIE);
}

export const STAFF = ['owner', 'founder', 'admin', 'moderator'];
export const isStaff = (u) => !!u && STAFF.includes(u.role);
export const isOwner = (u) => !!u && ['owner', 'founder'].includes(u.role);
