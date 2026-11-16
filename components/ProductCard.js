'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { money } from '@/lib/client';
import { CATEGORY_GRAD } from '@/lib/ui';
import { useSite } from './SiteProvider';

export default function ProductCard({ p, locked }) {
  const { cartAdd, user, notify } = useSite();
  const router = useRouter();
  const grad = CATEGORY_GRAD[p.category] || CATEGORY_GRAD.valorant;

  const add = () => {
    if (locked) {
      notify('Bu araç için gerekli rol yok.', 'err');
      return;
    }
    if (!user) {
      notify('Sepete eklemek için giriş yapmalısın.', 'err');
      router.push('/giris');
      return;
    }
    cartAdd(p);
  };

  const isFree = p.price === 0;

  return (
    <article className="prod">
      {locked && <span className="lock-pill">🔒 {p.minRole} özel</span>}
      <Link href={`/urun/${p.slug}`}>
        <div className="prod-img" style={{ background: grad }}>
          {p.name.slice(0, 2).toUpperCase()}
          <span className="type">{p.type}</span>
        </div>
      </Link>
      <div className="prod-body">
        <Link href={`/urun/${p.slug}`}>
          <h3>{p.name}</h3>
        </Link>
        <p className="desc">{p.description}</p>
        <div className="prod-foot">
          <span className={`price ${isFree ? 'free' : ''}`}>{isFree ? 'ÜCRETSİZ' : money(p.price)}</span>
          {isFree ? (
            <Link href={`/urun/${p.slug}`} className="btn btn-sm btn-gold">
              ⬇ Ücretsiz İndir
            </Link>
          ) : (
            <button className="btn btn-sm btn-gold" onClick={add}>
              Sepete Ekle
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
