'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSite } from '@/components/SiteProvider';
import ProductCard from '@/components/ProductCard';
import { Empty } from '@/lib/ui';

const RANK = { member: 0, booster: 1, sponsor: 2, moderator: 3, admin: 4, founder: 5, owner: 6 };

function StoreInner() {
  const { boot, user } = useSite();
  const params = useSearchParams();
  const [cat, setCat] = useState(params.get('cat') || 'all');
  const [q, setQ] = useState('');

  const categories = boot?.categories || [];
  const products = boot?.products || [];

  const list = useMemo(() => {
    return products
      .filter((p) => (cat === 'all' ? true : p.category === cat))
      .filter((p) =>
        q.trim()
          ? (p.name + ' ' + p.description + ' ' + p.type).toLowerCase().includes(q.toLowerCase())
          : true
      )
      .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }, [products, cat, q]);

  const locked = (p) => p.minRole && (!user || (RANK[user.role] ?? 0) < (RANK[p.minRole] ?? 99));

  return (
    <section className="sec wrap">
      <div className="sec-head">
        <div>
          <span className="kicker">Mağaza</span>
          <h1 className="sec-title">Tüm Ürünler</h1>
          <p className="sec-sub">Kategoriye göre filtrele, ara, sepete at — teslimat anında.</p>
        </div>
        <input
          className="search"
          placeholder="🔍 Ürün ara..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="filters">
        <button className={`filt ${cat === 'all' ? 'on' : ''}`} onClick={() => setCat('all')}>
          Tümü ({products.length})
        </button>
        {categories.map((c) => {
          const n = products.filter((p) => p.category === c.id).length;
          if (!n) return null;
          return (
            <button key={c.id} className={`filt ${cat === c.id ? 'on' : ''}`} onClick={() => setCat(c.id)}>
              {c.name} ({n})
            </button>
          );
        })}
      </div>

      {list.length === 0 ? (
        <Empty icon="🛒" text="Bu filtreyle eşleşen ürün yok." />
      ) : (
        <div className="prod-grid">
          {list.map((p) => (
            <ProductCard key={p.id} p={p} locked={locked(p)} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function StorePage() {
  return (
    <Suspense fallback={<div className="wrap sec mut">Yükleniyor...</div>}>
      <StoreInner />
    </Suspense>
  );
}
