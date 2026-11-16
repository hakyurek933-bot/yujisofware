'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useSite } from '@/components/SiteProvider';
import ProductCard from '@/components/ProductCard';
import { CATEGORY_GRAD, Empty } from '@/lib/ui';
import { money } from '@/lib/client';

const RANK = { member: 0, booster: 1, sponsor: 2, moderator: 3, admin: 4, founder: 5, owner: 6 };

export default function ProductPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { boot, user, cartAdd, notify } = useSite();

  const products = boot?.products || [];
  const p = products.find((x) => x.slug === slug);

  if (!p) {
    return (
      <section className="sec wrap">
        <Empty icon="🔍" text="Ürün bulunamadı veya yayından kaldırılmış." />
        <div style={{ textAlign: 'center' }}>
          <Link href="/magaza" className="btn btn-gold">
            Mağazaya Dön
          </Link>
        </div>
      </section>
    );
  }

  const grad = CATEGORY_GRAD[p.category] || CATEGORY_GRAD.valorant;
  const rank = user ? RANK[user.role] ?? 0 : -1;
  const locked = !!p.minRole && rank < (RANK[p.minRole] ?? 99);
  const related = products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 3);

  const add = () => {
    if (!user) {
      notify('Sepete eklemek için giriş yapmalısın.', 'err');
      router.push('/giris');
      return;
    }
    if (locked) return notify(`Bu ürün için ${p.minRole} rolü gerekli.`, 'err');
    cartAdd(p);
    router.push('/sepet');
  };

  return (
    <section className="sec wrap">
      <div className="mut" style={{ marginBottom: 18, fontSize: 13.5 }}>
        <Link href="/magaza">Mağaza</Link> / <Link href={`/magaza?cat=${p.category}`}>{p.category.toUpperCase()}</Link> / {p.name}
      </div>

      <div className="split">
        <div>
          <div className="prod-img" style={{ background: grad, borderRadius: 16, height: 220, fontSize: 64, position: 'relative' }}>
            {p.name.slice(0, 2).toUpperCase()}
            <span className="type">{p.type}</span>
            {locked && <span className="lock-pill">🔒 {p.minRole} özel</span>}
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <div className="kv">
              <span className="k">Fiyat</span>
              <span className={`v price ${p.price === 0 ? 'free' : ''}`} style={{ fontSize: 24 }}>
                {money(p.price)}
              </span>
              <span className="k">Tür</span>
              <span className="v">{p.type}</span>
              <span className="k">Kategori</span>
              <span className="v">{p.category.toUpperCase()}</span>
              <span className="k">Stok</span>
              <span className="v">{p.stock > 0 ? `${p.stock} adet` : 'Sınırsız'}</span>
              {p.minRole && (
                <>
                  <span className="k">Erişim</span>
                  <span className="v">
                    <span className={`role-badge role-${p.minRole}`}>{p.minRole}+</span>
                  </span>
                </>
              )}
            </div>
            <button className="btn btn-gold btn-block" style={{ marginTop: 18 }} onClick={add}>
              {locked ? `🔒 ${p.minRole} rolü gerekli` : p.price === 0 ? 'Ücretsiz Olarak Al' : '🛒 Sepete Ekle'}
            </button>
            {locked && (
              <Link href="/booster" className="btn btn-violet btn-block" style={{ marginTop: 10 }}>
                Nasıl {p.minRole} olurum?
              </Link>
            )}
          </div>
        </div>

        <div>
          <span className="kicker">{p.type}</span>
          <h1 className="sec-title">{p.name}</h1>
          <p className="sec-sub" style={{ whiteSpace: 'pre-line', maxWidth: 'none', marginTop: 16 }}>
            {p.description}
          </p>

          {p.guide && (
            <div style={{ marginTop: 22 }}>
              <span className="kicker">Kullanım Rehberi</span>
              <pre className="pre" style={{ marginTop: 10 }}>
                {p.guide}
              </pre>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 22, flexWrap: 'wrap' }}>
            {p.youtube ? (
              <a href={p.youtube} target="_blank" rel="noreferrer" className="btn">
                ▶ YouTube Tanıtımı
              </a>
            ) : (
              <span className="btn" style={{ opacity: 0.5, cursor: 'default' }}>
                ▶ Video linki eklenmedi
              </span>
            )}
            {p.virustotal ? (
              <a href={p.virustotal} target="_blank" rel="noreferrer" className="btn">
                🛡️ VirusTotal Raporu
              </a>
            ) : (
              <span className="btn" style={{ opacity: 0.5, cursor: 'default' }}>
                🛡️ Tarama raporu eklenmedi
              </span>
            )}
            {p.download && p.price === 0 && (
              <a href={p.download} target="_blank" rel="noreferrer" className="btn btn-gold">
                ⬇ Doğrudan İndir
              </a>
            )}
          </div>

          {p.download && p.price > 0 && (
            <p className="form-note" style={{ marginTop: 12 }}>
              İndirme bağlantısı siparişin onaylandığında hesabındaki siparişler bölümünde açılır.
            </p>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <div style={{ marginTop: 46 }}>
          <div className="sec-head">
            <div>
              <span className="kicker">Benzer Ürünler</span>
              <h2 className="sec-title" style={{ fontSize: 26 }}>
                Bu kategoride ayrıca
              </h2>
            </div>
          </div>
          <div className="prod-grid">
            {related.map((r) => (
              <ProductCard key={r.id} p={r} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
