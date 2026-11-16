export async function api(path, opts = {}) {
  const { method = 'GET', body } = opts;
  const res = await fetch('/api/' + path, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = { error: 'Sunucu yanıtı okunamadı.' };
  }
  if (!res.ok || data?.error) throw new Error(data?.error || 'Bir şeyler ters gitti.');
  return data;
}

export const money = (n, cur = '₺') =>
  Number(n) === 0 ? 'Ücretsiz' : `${cur}${Number(n).toLocaleString('tr-TR')}`;

export const timeAgo = (ts) => {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'az önce';
  if (s < 3600) return `${Math.floor(s / 60)} dk önce`;
  if (s < 86400) return `${Math.floor(s / 3600)} saat önce`;
  return `${Math.floor(s / 86400)} gün önce`;
};

export const dateTR = (ts) =>
  new Date(ts).toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' });
