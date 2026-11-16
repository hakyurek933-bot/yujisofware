'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSite } from '@/components/SiteProvider';

export default function LoginPage() {
  const { login, notify } = useSite();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      const u = await login(username, password);
      notify(`Hoş geldin, ${u.username}.`);
      router.push(u.role && ['owner', 'founder', 'admin', 'moderator'].includes(u.role) ? '/admin' : '/hesap');
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <form className="card auth-card" onSubmit={submit}>
        <h1>Giriş Yap</h1>
        <p className="hint">Yujisofware hesabınla giriş yap.</p>
        {err && <div className="err">{err}</div>}
        <div className="field">
          <label>Kullanıcı Adı / E-Posta</label>
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
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>
        <button className="btn btn-gold btn-block" disabled={busy}>
          {busy ? 'Giriş yapılıyor...' : 'GİRİŞ YAP'}
        </button>
        <p className="auth-alt">
          Henüz hesabın yok mu? <Link href="/kayit">Kayıt Ol</Link>
        </p>
      </form>
    </div>
  );
}
