'use client';

import Link from 'next/link';
import { useSite } from '@/components/SiteProvider';

export default function ContactPage() {
  const { boot } = useSite();
  const s = boot?.settings || {};

  return (
    <section className="sec wrap">
      <div className="sec-head">
        <div>
          <span className="kicker">İletişim</span>
          <h1 className="sec-title">Bize Ulaş</h1>
          <p className="sec-sub">Her kanal açık — en hızlısı her zaman Discord ticket.</p>
        </div>
      </div>

      <div className="prod-grid">
        <div className="card">
          <div style={{ fontSize: 30 }}>💬</div>
          <h3 style={{ margin: '10px 0 6px' }}>Discord</h3>
          <p className="mut" style={{ fontSize: 14 }}>
            Topluluğa katıl, duyuruları kaçırma, ticket ile anında destek al.
          </p>
          <a href={s.discord || '#'} target="_blank" rel="noreferrer" className="btn btn-violet btn-block" style={{ marginTop: 16 }}>
            Discord&apos;a Katıl
          </a>
        </div>
        <div className="card">
          <div style={{ fontSize: 30 }}>🎫</div>
          <h3 style={{ margin: '10px 0 6px' }}>Destek Bileti</h3>
          <p className="mut" style={{ fontSize: 14 }}>
            Satın alım, teknik sorun ve hata bildirimleri için doğrudan bilet aç.
          </p>
          <Link href="/destek" className="btn btn-gold btn-block" style={{ marginTop: 16 }}>
            Bilet Oluştur
          </Link>
        </div>
        <div className="card">
          <div style={{ fontSize: 30 }}>📧</div>
          <h3 style={{ margin: '10px 0 6px' }}>E-Posta</h3>
          <p className="mut" style={{ fontSize: 14 }}>
            İş birliği ve sponsorluk talepleri için yaz.
          </p>
          <a href={`mailto:${s.email || ''}`} className="btn btn-block" style={{ marginTop: 16 }}>
            {s.email || 'destek@yujisofware.win'}
          </a>
        </div>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h3 style={{ marginBottom: 10 }}>Yanıt Süreleri</h3>
        <div className="kv">
          <span className="k">Discord ticket</span>
          <span className="v">Ortalama 15 dakika (7/24)</span>
          <span className="k">E-posta</span>
          <span className="v">Ortalama 6 saat</span>
          <span className="k">Sponsorluk</span>
          <span className="v">1-2 iş günü</span>
        </div>
      </div>
    </section>
  );
}
