'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useSite } from './SiteProvider';

const NAV = [
  { href: '/', label: 'Ana Sayfa' },
  { href: '/magaza', label: 'Mağaza' },
  { href: '/cekilis', label: 'Çekiliş' },
  { href: '/booster', label: 'Booster VIP' },
  { href: '/destek', label: 'Destek' },
  { href: '/yorumlar', label: 'Yorumlar' },
  { href: '/iletisim', label: 'İletişim' }
];

const STAFF = ['owner', 'founder', 'admin', 'moderator'];

export default function Header() {
  const { boot, user, cart, logout, notify } = useSite();
  const [menu, setMenu] = useState(false);
  const [bell, setBell] = useState(false);
  const [read, setRead] = useState(false);
  const path = usePathname();
  const router = useRouter();
  const box = useRef(null);

  const announcements = boot?.announcements || [];
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const isStaff = user && STAFF.includes(user.role);

  useEffect(() => {
    setMenu(false);
    setBell(false);
  }, [path]);

  useEffect(() => {
    try {
      setRead(localStorage.getItem('yj_ann_read') === String(announcements[0]?.createdAt || ''));
    } catch {}
  }, [announcements]);

  useEffect(() => {
    const h = (e) => {
      if (box.current && !box.current.contains(e.target)) {
        setMenu(false);
        setBell(false);
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const openBell = () => {
    setBell((v) => !v);
    setMenu(false);
    setRead(true);
    try {
      localStorage.setItem('yj_ann_read', String(announcements[0]?.createdAt || ''));
    } catch {}
  };

  const doLogout = async () => {
    await logout();
    notify('Çıkış yapıldı.');
    router.push('/');
  };

  return (
    <>
      {announcements.length > 0 && (
        <div className="announce">
          <div className="announce-in">
            <span className="announce-tag">👑 Owner Duyurusu</span>
            <b>{announcements[0].title}</b>
            <span className="mut">{announcements[0].body}</span>
            <Link className="btn btn-sm btn-gold" href="/magaza">
              İncele
            </Link>
          </div>
        </div>
      )}

      <header className="hdr">
        <div className="wrap hdr-in">
          <Link href="/" className="logo">
            <span className="logo-mark">Y</span>
            <b>
              Yuji<span>sofware</span>
            </b>
            <span className="live">● live</span>
          </Link>

          <nav className="nav">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className={path === n.href ? 'on' : ''}>
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="hdr-actions" ref={box}>
            <div className="relative">
              <button className="icon-btn" onClick={openBell} title="Bildirimler">
                🔔
                {!read && announcements.length > 0 && <span className="count">{announcements.length}</span>}
              </button>
              {bell && (
                <div className="dropdown" style={{ minWidth: 320 }}>
                  <div style={{ padding: '6px 10px', fontSize: 12, letterSpacing: '0.1em', color: 'var(--mut)', fontWeight: 800 }}>
                    BİLDİRİMLER
                  </div>
                  {announcements.length === 0 && (
                    <div style={{ padding: 12, color: 'var(--mut)', fontSize: 13 }}>Henüz bildirimin yok.</div>
                  )}
                  {announcements.map((a) => (
                    <div key={a.id} style={{ padding: '10px 12px', borderTop: '1px solid var(--line)' }}>
                      <b style={{ fontSize: 13.5 }}>{a.title}</b>
                      <div style={{ fontSize: 13, color: 'var(--mut)' }}>{a.body}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link href="/sepet" className="icon-btn" title="Sepet">
              🛒
              {cartCount > 0 && <span className="count">{cartCount}</span>}
            </Link>

            {!user ? (
              <>
                <Link href="/giris" className="btn btn-sm">
                  Giriş
                </Link>
                <Link href="/kayit" className="btn btn-sm btn-gold">
                  Kayıt Ol
                </Link>
              </>
            ) : (
              <div className="relative">
                <button className="chip" onClick={() => { setMenu((v) => !v); setBell(false); }}>
                  <span className="avatar">{user.username[0].toUpperCase()}</span>
                  {user.username}
                  <span className={`role-badge role-${user.role}`}>{user.role}</span>
                </button>
                {menu && (
                  <div className="dropdown">
                    <Link href="/hesap">👤 Hesabım</Link>
                    <Link href="/hesap?tab=orders">📦 Siparişlerim</Link>
                    <Link href="/destek">🎫 Destek Biletlerim</Link>
                    {isStaff && (
                      <Link href="/admin">🛠️ Yetkili Paneli</Link>
                    )}
                    <div className="sep" />
                    <button onClick={doLogout}>↩ Çıkış Yap</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
