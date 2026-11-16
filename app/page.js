'use client';

import Link from 'next/link';
import { useSite } from '@/components/SiteProvider';
import ProductCard from '@/components/ProductCard';
import { Stars, CATEGORY_GRAD } from '@/lib/ui';

const FEATURES = [
  { i: '💰', t: '%100 Ücretsiz', d: 'Hiçbir ürün satılmıyor — hepsi ücretsiz dağıtılıyor.' },
  { i: '🛡️', t: '%100 Undetected', d: 'Aktif ban koruma mekanizması ve periyodik güncelleme.' },
  { i: '⚡', t: 'Anında Teslimat', d: 'Giriş yap, indir — bekleme, sıra, ödeme yok.' },
  { i: '🎧', t: '7/24 Aktif Destek', d: 'Ticket sistemi, ortalama yanıt süresi 15 dakikanın altında.' }
];

const FAQ = [
  {
    q: 'Ürünler gerçekten ücretsiz mi?',
    a: 'Evet. Yujisofware\'de hiçbir ürün satılmıyor — tüm hileler, hesaplar ve araçlar ücretsiz dağıtılıyor. Üye ol, giriş yap, indir. Ödeme, lisans ücreti ya da kredi kartı istenmez.'
  },
  {
    q: 'Çekilişe nasıl katılırım?',
    a: 'Çekilişler sayfasından hesabınla giriş yap ve "Çekilişe Katıl" butonuna bas. Süre bitince kazanan panel tarafından çekilir ve sitede duyurulur. Discord\'da boost basan üyeler için ikinci bir şans hakkı tanımlanabilir.'
  },
  {
    q: 'Araçlar güvenli mi, ban yer miyim?',
    a: 'Tüm ürünler düzenli olarak test edilmekte ve güncellenmektedir. Spoofer & bypass araçlarımız aktif ban koruma mekanizmasıyla çalışır ve periyodik güncellemeler alır.'
  },
  {
    q: 'Teknik destek alabilir miyim?',
    a: 'Evet. Tüm ürünlerde destek Discord üzerinden 7/24 sağlanıyor. Ortalama yanıt süremiz 15 dakikanın altındadır.'
  }
];

export default function Home() {
  const { boot, user } = useSite();
  const s = boot?.settings || {};
  const products = boot?.products || [];
  const categories = boot?.categories || [];
  const reviews = (boot?.reviews || []).slice(0, 6);
  const stats = boot?.stats || {};
  const giveaways = (boot?.giveaways || []).filter((g) => g.status === 'active');

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <div className="hero-badges">
            <span className="pill gold">👑 {s.siteName || 'Yujisofware'} Live System</span>
            <span className="pill green">● %100 Ücretsiz</span>
            <span className="pill violet">🎁 Ödeme Yok — Sadece İndir</span>
            <span className="pill">🎧 7/24 Destek</span>
          </div>
          <h1>
            {s.heroTitle || 'YUJISOFTWARE'} <em>.WIN</em>
          </h1>
          <p className="sub">{s.heroSub || s.tagline}</p>
          <div className="hero-cta">
            <Link href="/magaza" className="btn btn-gold">
              Ücretsiz Ürünleri İndir →
            </Link>
            <Link href="/cekilis" className="btn btn-violet">
              🎉 Çekilişler
            </Link>
            <Link href="/booster" className="btn">
              💎 Booster Özel
            </Link>
          </div>
          <div className="hero-stats">
            <div className="hstat">
              <b>{stats.products ?? 0}+</b>
              <span>Ücretsiz Araç</span>
            </div>
            <div className="hstat">
              <b>{stats.members ?? 0}+</b>
              <span>Kayıt Olan Üye</span>
            </div>
            <div className="hstat">
              <b>{stats.orders ?? 0}+</b>
              <span>İndirilen Araç</span>
            </div>
            <div className="hstat">
              <b>{stats.giveaways ?? 0}</b>
              <span>Açık Çekiliş</span>
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

        <div className="card" style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 34 }}>👥</span>
          <div>
            <b style={{ fontSize: 22 }}>{stats.members ?? 0} kişi kayı oldu</b>
            <div className="mut" style={{ fontSize: 13.5 }}>
              Topluluğa katıl — ücretsiz araçlara anında eriş, çekilişlere gir.
            </div>
          </div>
          <Link href={user ? '/magaza' : '/kayit'} className="btn btn-gold" style={{ marginLeft: 'auto' }}>
            {user ? 'Araçlara Git' : 'Ücretsiz Kayıt Ol'}
          </Link>
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

      {products.length > 0 ? (
        <section className="sec wrap">
          <div className="sec-head">
            <div>
              <span className="kicker">Ücretsiz Araçlar</span>
              <h2 className="sec-title">Hemen İndir, Hemen Oyna</h2>
              <p className="sec-sub">Hiçbiri satılmıyor — üye ol, indir, kullan.</p>
            </div>
            <Link href="/magaza" className="btn btn-sm">
              Tüm Araçlar →
            </Link>
          </div>
          <div className="prod-grid">
            {[...products].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)).slice(0, 6).map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      ) : (
        <section className="sec wrap">
          <div className="booster-band" style={{ background: 'linear-gradient(135deg, rgba(124,92,255,0.14), rgba(55,229,255,0.12))', borderColor: 'rgba(124,92,255,0.4)' }}>
            <span className="kicker">Katalog</span>
            <h2 className="sec-title" style={{ maxWidth: 640 }}>
              Araçlar Yükleniyor — İlk Sürüm Yakında
            </h2>
            <p className="sec-sub">
              Araçlar kategori bazında ekleniyor. Discord&apos;a katıl, yeni araçlardan ilk haberdar ol.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 22, flexWrap: 'wrap' }}>
              <a href={s.discord || '#'} target="_blank" rel="noreferrer" className="btn btn-gold">
                Discord&apos;a Katıl
              </a>
              <Link href="/cekilis" className="btn btn-violet">
                🎉 Çekilişe Katıl
              </Link>
            </div>
          </div>
        </section>
      )}

      {giveaways.length > 0 && (
        <section className="sec wrap">
          <div
            className="booster-band"
            style={{ background: 'linear-gradient(135deg, rgba(245,196,81,0.14), rgba(255,138,224,0.14))', borderColor: 'rgba(245,196,81,0.4)' }}
          >
            <span className="kicker">🎉 Çekiliş</span>
            <h2 className="sec-title" style={{ maxWidth: 680 }}>
              {giveaways[0].title}
            </h2>
            <p className="sec-sub">
              Ödül: <b className="gold">{giveaways[0].prize}</b> — katılım tamamen ücretsiz, sonuçlar sitede duyurulur.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 22, flexWrap: 'wrap' }}>
              <Link href="/cekilis" className="btn btn-gold">
                Çekilişe Katıl →
              </Link>
              <Link href="/cekilis" className="btn">
                Tüm Çekilişler
              </Link>
            </div>
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
