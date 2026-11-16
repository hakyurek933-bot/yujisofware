import crypto from 'node:crypto';

export const uid = (p = '') => p + crypto.randomBytes(6).toString('hex');

export const json = (data, init = {}) =>
  new Response(JSON.stringify(data), {
    status: init.status || 200,
    headers: { 'content-type': 'application/json', ...(init.headers || {}) }
  });

const TR = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', İ: 'i' };

export const slugify = (s = '') =>
  String(s)
    .toLowerCase()
    .replace(/[çğıöşüİ]/g, (m) => TR[m] || m)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || uid('p-');

export const RANK = { member: 0, booster: 1, sponsor: 2, moderator: 3, admin: 4, founder: 5, owner: 6 };

export const roleAtLeast = (role, min) => (RANK[role] ?? -1) >= (RANK[min] ?? 99);

export const pub = (u) =>
  u
    ? {
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role,
        bio: u.bio || '',
        banned: !!u.banned,
        banReason: u.banReason || '',
        createdAt: u.createdAt || 0,
        lastLogin: u.lastLogin || 0
      }
    : null;

export const validUsername = (s = '') => /^[a-z0-9_.]{3,24}$/i.test(s);
export const validEmail = (s = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

// sequence like abc / 123 / aaaa are refused at the gate
export const weakPassword = (pw = '', username = '') => {
  if (pw.length < 6) return true;
  if (username && pw.toLowerCase().includes(username.toLowerCase())) return true;
  if (/(.)\1{2,}/.test(pw)) return true;
  let run = 1;
  for (let i = 1; i < pw.length; i++) {
    const a = pw.charCodeAt(i - 1);
    const b = pw.charCodeAt(i);
    if (b - a === 1 || a - b === 1) {
      run++;
      if (run >= 3) return true;
    } else run = 1;
  }
  return false;
};
