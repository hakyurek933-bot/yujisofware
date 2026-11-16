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
    if (!user) {
      notify('Sepete eklemek için giriş yapmalısın.', 'err');
      router.push('/giris');
      return;
    }
    if (locked) {
      notify('Bu ürün için gerekli rol yok.', 'err');
      return;
    }
    cartAdd(p);
  };

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
          <span className={`price ${p.price === 0 ? 'free' : ''}`}>{money(p.price)}</span>
          <button className="btn btn-sm btn-gold" onClick={add}>
            {p.price === 0 ? 'Ücretsiz Al' : 'Sepete Ekle'}
          </button>
        </div>
      </div>
    </article>
  );
}
