'use client';

import Link from 'next/link';
import { useSite } from '@/components/SiteProvider';
import ProductCard from '@/components/ProductCard';
import { Stars, CATEGORY_GRAD } from '@/lib/ui';

const FEATURES = [
  { i: '🛡️', t: '%100 Undetected', d: 'Aktif ban koruma mekanizması ve periyodik güncelleme.' },
  { i: '⚡', t: 'Anında Teslimat', d: 'Ödeme sonrası lisans ve dosyalar otomatik iletilir.' },
  { i: '💎', t: 'VIP Booster Club', d: 'Boostlayan üyelere özel indirim, rol ve beta erişimi.' },
  { i: '🎧', t: '7/24 Aktif Destek', d: 'Ticket sistemi, ortalama yanıt süresi 15 dakikanın altında.' }
];

const FAQ = [
  {
    q: 'Ürünler ne kadar sürede teslim edilir?',
    a: 'Dijital ürünler sipariş onayının ardından anında teslim edilir. Ücretsiz ürünlerde indirme bağlantısı hesabına anında açılır; ödemeli siparişler yetkili onayından sonra aktif olur.'
  },
  {
    q: 'İade politikanız nedir?',
    a: 'Dijital ürünlerde teslimat sağlandıktan sonra iade mümkün değildir. Sorun yaşarsan destek biletini aç, ekibimiz çözüm üretene kadar talep açık kalır.'
  },
  {
    q: 'Araçlar güvenli mi, ban yer miyim?',
    a: 'Tüm ürünler düzenli olarak test edilmekte ve güncellenmektedir. Spoofer & bypass araçlarımız aktif ban koruma mekanizmasıyla çalışır ve periyodik güncellemeler alır.'
  },
  {
    q: 'Teknik destek alabilir miyim?',
    a: 'Evet. Tüm ürünlerde satın alma sonrası Discord üzerinden 7/24 teknik destek sağlıyoruz. Ortalama yanıt süremiz 15 dakikanın altındadır.'
  },
  {
    q: 'Yapay zeka kategorisinde ne var?',
    a: 'Oyun botları, oto-farm araçları ve AI destekli analiz programları sunuyoruz. Popüler oyunlar için özel eğitilmiş modeller mevcuttur.'
  }
];

export default function Home() {
  const { boot, user } = useSite();
  const s = boot?.settings || {};
  const products = boot?.products || [];
  const categories = boot?.categories || [];
  const reviews = (boot?.reviews || []).slice(0, 6);
  const stats = boot?.stats || {};
  const featured = products.filter((p) => p.featured).slice(0, 3);

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <div className="hero-badges">
            <span className="pill gold">👑 {s.siteName || 'Yujisofware'} Live System</span>
            <span className="pill green">● %100 Undetected</span>
            <span className="pill violet">⚡ Anında Teslimat</span>
            <span className="pill">🎧 7/24 Destek</span>
          </div>
          <h1>
            {s.heroTitle || 'YUJISOFTWARE'} <em>.WIN</em>
          </h1>
          <p className="sub">{s.heroSub || s.tagline}</p>
          <div className="hero-cta">
            <Link href="/magaza" className="btn btn-gold">
              Mağazayı Keşfet →
            </Link>
            <Link href="/booster" className="btn btn-violet">
              💎 Booster Özel
            </Link>
          </div>
          <div className="hero-stats">
            <div className="hstat">
              <b>{stats.products ?? 0}+</b>
              <span>Aktif Ürün</span>
            </div>
            <div className="hstat">
              <b>{stats.members ?? 0}+</b>
              <span>Kayıtlı Üye</span>
            </div>
            <div className="hstat">
              <b>{stats.orders ?? 0}+</b>
              <span>Tamamlanan Teslimat</span>
            </div>
            <div className="hstat">
              <b>%99.4</b>
              <span>Müşteri Memnuniyeti</span>
            </div>
          </div>
        </div>
      </section>

      <section className="wrap">
        <div className="feats">
          {FEATURES.map((f) => (
            <div className="feat" key={f.t}>
              <span className="ico">{f.i}</span>
              <div>
                <b>{f.t}</b>
                <span>{f.d}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="sec wrap">
        <div className="sec-head">
          <div>
            <span className="kicker">Kategoriler</span>
            <h2 className="sec-title">Oyununu Seç, Gücünü Al</h2>
            <p className="sec-sub">Her kategori kendi uzman ekibiyle yönetilir — hepsi tek çatı altında.</p>
          </div>
          <Link href="/magaza" className="btn btn-sm">
            Tüm Ürünler →
          </Link>
        </div>
        <div className="cats">
          {categories.map((c) => (
            <Link key={c.id} href={`/magaza?cat=${c.id}`} className="cat" style={{ background: c.grad || CATEGORY_GRAD[c.id] }}>
              <span className="tag">{c.tag}</span>
              <h3>{c.name}</h3>
              <p>{c.desc}</p>
              <span className="go">Ürünleri İncele →</span>
            </Link>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="sec wrap">
          <div className="sec-head">
            <div>
              <span className="kicker">Öne Çıkanlar</span>
              <h2 className="sec-title">En Çok Tercih Edilenler</h2>
            </div>
            <Link href="/magaza" className="btn btn-sm">
              Katalogda Gör →
            </Link>
          </div>
          <div className="prod-grid">
            {featured.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      )}

      <section className="sec wrap">
        <div className="sec-head">
          <div>
            <span className="kicker">Topluluk Duvarı</span>
            <h2 className="sec-title">Üye Düşünceleri &amp; Geri Bildirim</h2>
            <p className="sec-sub">Yujisofware ailesinin görüşleri. Sen de deneyimini toplulukla paylaş.</p>
          </div>
          <Link href="/yorumlar" className="btn btn-sm btn-gold">
            Düşünceni Paylaş
          </Link>
        </div>
        {reviews.length === 0 ? (
          <div className="card mut">Henüz onaylı yorum yok — ilk yorumu sen yaz.</div>
        ) : (
          <div className="rev-grid">
            {reviews.map((r) => (
              <div className="rev" key={r.id}>
                <Stars n={r.rating} />
                <p>{r.text}</p>
                <div className="rev-who">
                  <span className="avatar">{(r.user || '?')[0].toUpperCase()}</span>
                  <b>{r.user}</b>
                  <span className="rev-cat">{r.category}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="sec wrap">
        <div className="sec-head">
          <div>
            <span className="kicker">S.S.S</span>
            <h2 className="sec-title">Sıkça Sorulan Sorular</h2>
          </div>
        </div>
        <div className="faq">
          {FAQ.map((f) => (
            <details className="faq-item" key={f.q}>
              <summary>{f.q}</summary>
              <div className="a">{f.a}</div>
            </details>
          ))}
        </div>
      </section>

      <section className="sec wrap">
        <div className="booster-band">
          <span className="kicker">Discord Server Booster VIP</span>
          <h2 className="sec-title" style={{ maxWidth: 640 }}>
            BOOSTER CLUB — Boostlayanlara Ayrıcalık
          </h2>
          <p className="sec-sub">
            Discord sunucumuza takviye basan üyelere ayrılmış özel VIP ayrıcalık merkezi.
          </p>
          <div className="perks">
            <div className="perk">
              <div className="ico">💎</div>
              <b>Özel VIP Rol &amp; Oda</b>
              <span>Parıldayan Server Booster rozeti ve boosterlara özel gizli sohbet odası.</span>
            </div>
            <div className="perk">
              <div className="ico">🚀</div>
              <b>Özel Beta &amp; Erken Erişim</b>
              <span>Tüm güncellemelere herkesten önce ilk erişim ve test hakkı.</span>
            </div>
            <div className="perk">
              <div className="ico">🎫</div>
              <b>Öncelikli 7/24 Ticket</b>
              <span>Taleplerin yüksek öncelikli işaretlenir, hızlı yanıt alırsın.</span>
            </div>
            <div className="perk">
              <div className="ico">🎁</div>
              <b>Özel İndirim &amp; Hediyeler</b>
              <span>İndirim kodları, lisans anahtarları ve boosterlara özel dağıtımlar.</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 24, flexWrap: 'wrap' }}>
            <Link href="/booster" className="btn btn-gold">
              Booster Ürünlerini Gör
            </Link>
            <a href={s.discord || '#'} target="_blank" rel="noreferrer" className="btn btn-violet">
              Discord&apos;a Katıl
            </a>
          </div>
        </div>
      </section>

      <section className="sec wrap">
        <div className="card" style={{ textAlign: 'center', padding: 44 }}>
          <h2 className="sec-title">Topluluğumuza Katıl</h2>
          <p className="sec-sub" style={{ margin: '12px auto 24px' }}>
            Yeni ürünler, duyurular ve destek için Discord sunucumuza katıl.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={s.discord || '#'} target="_blank" rel="noreferrer" className="btn btn-violet">
              Discord&apos;a Katıl
            </a>
            <Link href={user ? '/destek' : '/kayit'} className="btn btn-gold">
              {user ? 'Destek Bileti Aç' : 'Hemen Kayıt Ol'}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
