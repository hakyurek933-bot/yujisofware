'use client';

import Link from 'next/link';
import { useSite } from './SiteProvider';

export default function Footer() {
  const { boot } = useSite();
  const s = boot?.settings || {};
  return (
    <footer className="ftr">
      <div className="wrap">
        <div className="ftr-grid">
          <div>
            <div className="logo" style={{ marginBottom: 12 }}>
              <span className="logo-mark">Y</span>
              <b>
                Yuji<span>sofware</span>
              </b>
            </div>
            <p>{s.tagline || 'ONLY SKILL. ONLY POWER. ONLY US.'}</p>
            <p>Undetected premium game tools, anında teslimat ve 7/24 ticket desteği.</p>
            <a href={s.discord || '#'} target="_blank" rel="noreferrer" className="btn btn-sm btn-violet" style={{ marginTop: 8 }}>
              Discord&apos;a Katıl
            </a>
          </div>
          <div>
            <h4>Mağaza</h4>
            <Link href="/magaza">Tüm Ürünler</Link>
            <Link href="/magaza?cat=valorant">Valorant</Link>
            <Link href="/magaza?cat=cs2">Counter Strike 2</Link>
            <Link href="/magaza?cat=ai">Yapay Zeka</Link>
            <Link href="/booster">Booster Özel</Link>
          </div>
          <div>
            <h4>Destek</h4>
            <Link href="/destek">Bilet Oluştur</Link>
            <Link href="/yorumlar">Yorumlar</Link>
            <Link href="/iletisim">İletişim</Link>
            <Link href="/hesap">Hesabım</Link>
          </div>
          <div>
            <h4>Hesap</h4>
            <Link href="/giris">Giriş Yap</Link>
            <Link href="/kayit">Kayıt Ol</Link>
            <a href={`mailto:${s.email || ''}`}>{s.email || 'destek@yujisofware.win'}</a>
          </div>
        </div>
        <div className="ftr-bottom">
          <span>© {new Date().getFullYear()} Yujisofware. Tüm hakları saklıdır.</span>
          <span>ofx was here</span>
        </div>
      </div>
    </footer>
  );
}
