'use client';

import Link from 'next/link';
import { useSite } from '@/components/SiteProvider';
import Title from '@/components/Title';
import ProductCard from '@/components/ProductCard';

export default function BoosterPage() {
  const { boot, user } = useSite();
  const s = boot?.settings || {};
  const products = (boot?.products || []).filter((p) => p.category === 'booster' || p.minRole);

  const hasRole = user && ['booster', 'sponsor', 'moderator', 'admin', 'founder', 'owner'].includes(user.role);

  return (
    <>
      <section className="sec wrap">
        <Title>Booster VIP</Title>
        <div className="booster-band">
          <span className="kicker">VIP Boost Ayrıcalığı</span>
          <h1 className="sec-title" style={{ maxWidth: 700 }}>
            BOOSTER CLUB — Sunucuya Bas, Ayrıcalıkları Topla
          </h1>
          <p className="sec-sub">
            Discord sunucumuza takviye (Boost) basan üyelerimize ayrılmış özel VIP ayrıcalık merkezi.
          </p>
          <div className="perks">
            <div className="perk">
              <div className="ico">💎</div>
              <b>Özel VIP Rol &amp; Oda</b>
              <span>Discord&apos;da parıldayan Server Booster rozeti ve sadece boosterlara özel gizli sohbet odası erişimi.</span>
            </div>
            <div className="perk">
              <div className="ico">🚀</div>
              <b>Özel Beta &amp; Erken Erişim</b>
              <span>Tüm yeni spoofer, bypass ve güncellemelere herkesten önce ilk erişim ve test hakkı.</span>
            </div>
            <div className="perk">
              <div className="ico">🎫</div>
              <b>Öncelikli 7/24 Ticket</b>
              <span>Taleplerin doğrudan &apos;Yüksek Öncelikli&apos; olarak işaretlenir, yetkililerce hızla yanıtlanır.</span>
            </div>
            <div className="perk">
              <div className="ico">🎁</div>
              <b>Özel İndirim &amp; Hediyeler</b>
              <span>İndirim kodları, sürpriz lisans anahtarları ve boosterlara özel periyodik araç dağıtımları.</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 26, flexWrap: 'wrap' }}>
            <a href={s.discord || '#'} target="_blank" rel="noreferrer" className="btn btn-gold">
              Discord&apos;da Boostla
            </a>
            <Link href="/destek" className="btn btn-violet">
              💎 Booster Rolü Talebi Aç
            </Link>
          </div>
          {user && (
            <p className="form-note" style={{ marginTop: 16 }}>
              Mevcut rolün: <span className={`role-badge role-${user.role}`}>{user.role}</span>{' '}
              {hasRole
                ? '— booster ürünlerine erişimin açık.'
                : '— booster rolü almak için boost bas ve destek bileti aç.'}
            </p>
          )}
        </div>
      </section>

      <section className="sec wrap">
        <div className="sec-head">
          <div>
            <span className="kicker">Booster Özel</span>
            <h2 className="sec-title">VIP Erişimli Ürünler</h2>
            <p className="sec-sub">Bu ürünler sadece booster ve üstü rollere açıktır.</p>
          </div>
          <Link href="/magaza" className="btn btn-sm">
            Tüm Mağaza →
          </Link>
        </div>
        {products.length === 0 ? (
          <div className="card mut">Henüz booster ürünü eklenmedi.</div>
        ) : (
          <div className="prod-grid">
            {products.map((p) => (
              <ProductCard key={p.id} p={p} locked={p.minRole && !hasRole} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
