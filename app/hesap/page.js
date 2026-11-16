'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useSite } from '@/components/SiteProvider';
import Title from '@/components/Title';
import { api, money, dateTR } from '@/lib/client';
import { Empty, RoleBadge } from '@/lib/ui';

const TABS = [
  { id: 'profile', label: '👤 Profil & Bilgilerim', icon: '👤' },
  { id: 'orders', label: '📦 Siparişlerim', icon: '📦' },
  { id: 'security', label: '🔐 Güvenlik & Şifre', icon: '🔐' },
  { id: 'vip', label: '💎 VIP & Booster', icon: '💎' },
  { id: 'activity', label: '🕓 Aktivite Geçmişi', icon: '🕓' }
];

const ORDER_STATUS = { pending: 'Onay Bekliyor', paid: 'Ödendi / Teslim Edildi', cancelled: 'İptal' };

function AccountInner() {
  const { user, setUser, notify, login } = useSite();
  const router = useRouter();
  const params = useSearchParams();
  const [tab, setTab] = useState(params.get('tab') || 'profile');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [cur, setCur] = useState('');
  const [next, setNext] = useState('');
  const [next2, setNext2] = useState('');
  const [orders, setOrders] = useState([]);
  const [msg, setMsg] = useState(null);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginErr, setLoginErr] = useState('');

  useEffect(() => {
    if (!user) return;
    setUsername(user.username);
    setEmail(user.email);
    setBio(user.bio || '');
    api('orders')
      .then((d) => setOrders(d.orders))
      .catch(() => {});
  }, [user]);

  const doLogin = async (e) => {
    e.preventDefault();
    setLoginErr('');
    try {
      await login(loginUser, loginPass);
    } catch (err) {
      setLoginErr(err.message);
    }
  };

  if (!user) {
    return (
      <section className="sec wrap">
        <Title>Hesabım</Title>
        <div className="card auth-card" style={{ margin: '0 auto' }}>
          <span className="kicker">👤 Hesabım</span>
          <h1 style={{ fontSize: 24, marginTop: 8 }}>Giriş Yap</h1>
          <p className="hint" style={{ marginTop: 6 }}>
            Siparişlerin, biletlerin ve profil ayarların burada. Ücretsiz üye olmak da bir saniye.
          </p>
          {loginErr && <div className="err">{loginErr}</div>}
          <form onSubmit={doLogin}>
            <div className="field">
              <label>Kullanıcı Adı</label>
              <input value={loginUser} onChange={(e) => setLoginUser(e.target.value)} autoFocus required />
            </div>
            <div className="field">
              <label>Şifre</label>
              <input type="password" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} required />
            </div>
            <button className="btn btn-gold btn-block">GİRİŞ YAP</button>
          </form>
          <p className="auth-alt">
            Hesabın yok mu? <Link href="/kayit">Ücretsiz kayıt ol</Link>
          </p>
        </div>
      </section>
    );
  }

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const d = await api('account/update', { method: 'POST', body: { username, email, bio } });
      setUser(d.user);
      notify('Profil güncellendi.');
    } catch (e2) {
      notify(e2.message, 'err');
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (next !== next2) return notify('Yeni şifreler eşleşmiyor.', 'err');
    try {
      await api('account/password', { method: 'POST', body: { current: cur, next } });
      setCur('');
      setNext('');
      setNext2('');
      notify('Şifren güncellendi.');
    } catch (e2) {
      notify(e2.message, 'err');
    }
  };

  const isVip = ['booster', 'sponsor', 'moderator', 'admin', 'founder', 'owner'].includes(user.role);

  return (
    <section className="sec wrap">
      <Title>Hesabım</Title>
      <div className="sec-head">
        <div>
          <span className="kicker">Hesabım</span>
          <h1 className="sec-title">{user.username}</h1>
          <p className="sec-sub">
            Rol: <RoleBadge role={user.role} /> · Kayıt: {dateTR(user.createdAt)}
            {user.lastLogin ? ` · Son giriş: ${dateTR(user.lastLogin)}` : ''}
          </p>
        </div>
        <Link href="/magaza" className="btn btn-sm">
          Mağazaya Git
        </Link>
      </div>

      <div className="acc-grid">
        <div className="side">
          {TABS.map((t) => (
            <button key={t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
          <div className="sep" style={{ height: 1, background: 'var(--line)', margin: '8px 4px' }} />
          <button onClick={() => router.push('/destek')}>🎫 Destek Biletlerim</button>
        </div>

        <div>
          {tab === 'profile' && (
            <form className="card" onSubmit={saveProfile}>
              <h3 style={{ marginBottom: 16 }}>Hesap Detayları</h3>
              <div className="field">
                <label>Kullanıcı Adı</label>
                <input value={username} onChange={(e) => setUsername(e.target.value)} />
                <span className="form-note">Kullanıcı adı sabit ve benzersizdir.</span>
              </div>
              <div className="field">
                <label>E-Posta</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <span className="form-note">Bilet ve güvenlik bildirimleri bu adrese gönderilir.</span>
              </div>
              <div className="field">
                <label>Biyografi</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} style={{ minHeight: 90 }} />
              </div>
              <button className="btn btn-gold">Bilgileri Güncelle</button>
            </form>
          )}

          {tab === 'orders' && (
            <div>
              <div className="sec-head" style={{ marginBottom: 14 }}>
                <h3 style={{ fontSize: 20 }}>Siparişlerim ({orders.length})</h3>
                <Link href="/sepet" className="btn btn-sm">
                  Sepete Git
                </Link>
              </div>
              {orders.length === 0 ? (
                <Empty icon="📦" text="Henüz siparişin yok." />
              ) : (
                orders.map((o) => (
                  <div className="card" key={o.id} style={{ marginBottom: 12, padding: 18 }}>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                      <b>{o.id}</b>
                      <span className={`pill ${o.status === 'paid' ? 'green' : o.status === 'cancelled' ? '' : 'gold'}`}>
                        <span className={`badge-dot dot-${o.status}`} />
                        {ORDER_STATUS[o.status]}
                      </span>
                      <span className="price" style={{ marginLeft: 'auto', fontSize: 17 }}>
                        {money(o.total)}
                      </span>
                      <span className="mut" style={{ fontSize: 12.5 }}>
                        {dateTR(o.createdAt)}
                      </span>
                    </div>
                    <div style={{ marginTop: 12 }}>
                      {o.items.map((it, i) => (
                        <div
                          key={i}
                          style={{
                            display: 'flex',
                            gap: 10,
                            alignItems: 'center',
                            padding: '9px 0',
                            borderTop: '1px solid #1a1a2c',
                            fontSize: 14
                          }}
                        >
                          <span style={{ flex: 1 }}>
                            {it.name} <span className="mut">× {it.qty}</span>
                          </span>
                          <span className="mut">{money(it.price * it.qty)}</span>
                          {o.status === 'paid' && it.download && (
                            <a href={it.download} target="_blank" rel="noreferrer" className="btn btn-sm btn-gold">
                              ⬇ İndir
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                    {o.status === 'pending' && (
                      <p className="form-note" style={{ marginTop: 8 }}>
                        Siparişin yetkili onayı bekliyor — onaylandığında indirme bağlantısı açılır.
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'security' && (
            <form className="card" onSubmit={savePassword}>
              <h3 style={{ marginBottom: 6 }}>Şifre Değiştir</h3>
              <p className="form-note" style={{ marginBottom: 16 }}>
                Hesabını güvende tutmak için güçlü ve benzersiz bir şifre kullan.
              </p>
              <div className="field">
                <label>Mevcut Şifren</label>
                <input type="password" value={cur} onChange={(e) => setCur(e.target.value)} required />
              </div>
              <div className="field">
                <label>Yeni Şifre</label>
                <input type="password" value={next} onChange={(e) => setNext(e.target.value)} required />
              </div>
              <div className="field">
                <label>Yeni Şifre Tekrar</label>
                <input type="password" value={next2} onChange={(e) => setNext2(e.target.value)} required />
              </div>
              <button className="btn btn-gold">Şifreyi Güncelle</button>
              <div className="card" style={{ padding: 14, background: '#ffffff06', marginTop: 18 }}>
                <div className="kv">
                  <span className="k">Oturum Durumu</span>
                  <span className="v" style={{ color: 'var(--green)' }}>
                    ● Güvenli (HttpOnly cookie, HMAC-SHA256)
                  </span>
                  <span className="k">Şifre Karması</span>
                  <span className="v">bcrypt</span>
                </div>
              </div>
            </form>
          )}

          {tab === 'vip' && (
            <div className="card">
              <h3 style={{ marginBottom: 8 }}>VIP &amp; Booster Durumu</h3>
              <div className="kv" style={{ marginTop: 14 }}>
                <span className="k">Hesap Rolü</span>
                <span className="v">
                  <RoleBadge role={user.role} />
                </span>
                <span className="k">Booster Erişimi</span>
                <span className="v" style={{ color: isVip ? 'var(--green)' : 'var(--mut)' }}>
                  {isVip ? '● Aktif' : '○ Pasif'}
                </span>
                <span className="k">Sponsor Erişimi</span>
                <span className="v" style={{ color: ['sponsor', 'moderator', 'admin', 'founder', 'owner'].includes(user.role) ? 'var(--green)' : 'var(--mut)' }}>
                  {['sponsor', 'moderator', 'admin', 'founder', 'owner'].includes(user.role) ? '● Aktif' : '○ Pasif'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
                <a href="#" onClick={(e) => e.preventDefault()} className="btn btn-violet">
                  Discord&apos;da Boostla
                </a>
                <Link href="/destek" className="btn btn-gold">
                  💎 Booster Rolü Talebi Aç
                </Link>
                <Link href="/booster" className="btn">
                  Booster Avantajları
                </Link>
              </div>
            </div>
          )}

          {tab === 'activity' && (
            <div className="card">
              <h3 style={{ marginBottom: 14 }}>Son Hesap İşlemleri</h3>
              <div className="kv">
                <span className="k">Kayıt Tarihi</span>
                <span className="v">{dateTR(user.createdAt)}</span>
                <span className="k">Son Giriş</span>
                <span className="v">{user.lastLogin ? dateTR(user.lastLogin) : '—'}</span>
                <span className="k">Toplam Sipariş</span>
                <span className="v">{orders.length}</span>
                <span className="k">Açık Bilet</span>
                <span className="v">Destek sayfasından görüntüle</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="wrap sec mut">Yükleniyor...</div>}>
      <AccountInner />
    </Suspense>
  );
}
