'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSite } from '@/components/SiteProvider';
import Title from '@/components/Title';

export default function RegisterPage() {
  const { register, notify } = useSite();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const hasSeq = (pw) => {
    for (let i = 0; i + 2 < pw.length; i++) {
      const a = pw.charCodeAt(i), b = pw.charCodeAt(i + 1), c = pw.charCodeAt(i + 2);
      if ((b - a === 1 && c - b === 1) || (a - b === 1 && b - c === 1)) return true;
    }
    return false;
  };

  const checks = [
    { ok: password.length >= 6, t: 'En az 6 karakter' },
    { ok: !username || !password.toLowerCase().includes(username.toLowerCase()), t: 'Kullanıcı adınla aynı olmamalı' },
    { ok: !/(.)\1{2,}/.test(password), t: 'Aynı karakter 3+ kez tekrar etmemeli' },
    { ok: !hasSeq(password), t: 'Art arda harf/sayı dizisi olmamalı (abc, 123)' }
  ];
  const strong = checks.every((c) => c.ok);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      const u = await register(username, email, password);
      notify(`Hoş geldin ${u.username}, hesabın oluşturuldu.`);
      router.push('/magaza');
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <form className="card auth-card" onSubmit={submit}>
        <Title>Kayıt Ol</Title>
        <h1>Hoş Geldin!</h1>
        <p className="hint">Yujisofware&apos;ye katılmak için hesap oluştur. Ücretsiz &amp; hızlı.</p>
        {err && <div className="err">{err}</div>}
        <div className="field">
          <label>E-Posta</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@mail.com" required />
        </div>
        <div className="field">
          <label>Kullanıcı Adı</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="kullanıcı adın"
            required
            autoFocus
          />
        </div>
        <div className="field">
          <label>Şifre</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
        </div>

        <div className="card" style={{ padding: 14, background: '#ffffff06', marginBottom: 14 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.1em', color: 'var(--mut)', fontWeight: 800, marginBottom: 8 }}>
            ŞİFRE GEREKSİNİMLERİ
          </div>
          {checks.map((c) => (
            <div key={c.t} style={{ fontSize: 12.5, color: c.ok ? 'var(--green)' : 'var(--mut)', marginBottom: 4 }}>
              {c.ok ? '✔' : '○'} {c.t}
            </div>
          ))}
        </div>

        <button className="btn btn-gold btn-block" disabled={busy || !strong}>
          {busy ? 'Oluşturuluyor...' : 'HESAP OLUŞTUR'}
        </button>
        <p className="auth-alt">
          Zaten bir hesabın var mı? <Link href="/giris">Giriş Yap</Link>
        </p>
      </form>
    </div>
  );
}
