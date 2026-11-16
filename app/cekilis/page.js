'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSite } from '@/components/SiteProvider';
import Title from '@/components/Title';
import { api } from '@/lib/client';
import { Empty } from '@/lib/ui';

function Countdown({ endsAt }) {
  const [left, setLeft] = useState(endsAt - Date.now());
  useEffect(() => {
    const t = setInterval(() => setLeft(endsAt - Date.now()), 1000);
    return () => clearInterval(t);
  }, [endsAt]);

  if (left <= 0) return <span className="pill">Süre doldu</span>;
  const d = Math.floor(left / 86400000);
  const h = Math.floor((left % 86400000) / 3600000);
  const m = Math.floor((left % 3600000) / 60000);
  const s = Math.floor((left % 60000) / 1000);
  return (
    <span className="pill gold">
      ⏳ {d}g {String(h).padStart(2, '0')}s {String(m).padStart(2, '0')}d {String(s).padStart(2, '0')}sn
    </span>
  );
}

export default function GiveawaysPage() {
  const { user, notify, reloadBoot } = useSite();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(null);

  const load = () =>
    api('giveaways')
      .then((d) => setItems(d.giveaways))
      .catch(() => setItems([]));

  useEffect(() => {
    load();
  }, []);

  const join = async (g) => {
    if (!user) {
      notify('Çekilişe katılmak için giriş yapmalısın.', 'err');
      return router.push('/giris');
    }
    setBusy(g.id);
    try {
      const d = await api('giveaways/join', { method: 'POST', body: { id: g.id } });
      notify(`Katıldın! Toplam katılım: ${d.entryCount}`);
      load();
      reloadBoot();
    } catch (e) {
      notify(e.message, 'err');
    } finally {
      setBusy(null);
    }
  };

  const active = items.filter((g) => g.status === 'active');
  const past = items.filter((g) => g.status !== 'active');

  return (
    <section className="sec wrap">
      <Title>Çekilişler</Title>
      <div className="sec-head">
        <div>
          <span className="kicker">🎉 Çekiliş</span>
          <h1 className="sec-title">Çekilişler &amp; Ödüller</h1>
          <p className="sec-sub">
            Ücretsiz katıl, kura ile kazanan seçilir, sonuç sitede ve Discord&apos;da duyurulur.
          </p>
        </div>
        <span className="pill green">Katılım tamamen ücretsiz</span>
      </div>

      {active.length === 0 ? (
        <Empty icon="🎁" text="Şu an açık çekiliş yok. Discord'dan duyuruları takip et." />
      ) : (
        <div className="prod-grid">
          {active.map((g) => (
            <div className="card" key={g.id} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                <span className="pill gold">🎁 ÖDÜL</span>
                <Countdown endsAt={g.endsAt} />
              </div>
              <h3 style={{ fontSize: 20 }}>{g.title}</h3>
              <div style={{ fontSize: 15 }}>
                Ödül: <b className="gold">{g.prize}</b>
              </div>
              <p className="mut" style={{ fontSize: 13.5, flex: 1 }}>
                {g.description}
              </p>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <span className="pill">👥 {g.entryCount} katılım</span>
                {g.joined ? (
                  <span className="pill green" style={{ color: 'var(--green)' }}>
                    ✓ Katıldın
                  </span>
                ) : (
                  <button className="btn btn-sm btn-gold" onClick={() => join(g)} disabled={busy === g.id}>
                    {busy === g.id ? 'Katılınıyor...' : 'Çekilişe Katıl'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {past.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <div className="sec-head">
            <div>
              <span className="kicker">Geçmiş</span>
              <h2 className="sec-title" style={{ fontSize: 26 }}>
                Sonuçlanan Çekilişler
              </h2>
            </div>
          </div>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Çekiliş</th>
                  <th>Ödül</th>
                  <th>Katılım</th>
                  <th>Kazanan</th>
                  <th>Durum</th>
                </tr>
              </thead>
              <tbody>
                {past.map((g) => (
                  <tr key={g.id}>
                    <td>
                      <b>{g.title}</b>
                    </td>
                    <td className="gold">{g.prize}</td>
                    <td>{g.entryCount}</td>
                    <td>{g.winner ? <b style={{ color: 'var(--gold)' }}>🏆 {g.winner}</b> : <span className="mut">—</span>}</td>
                    <td>
                      <span className={`pill ${g.status === 'ended' ? '' : 'gold'}`}>{g.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: 30, textAlign: 'center' }}>
        <h3>Çekiliş kuralları</h3>
        <div className="kv" style={{ marginTop: 14, textAlign: 'left' }}>
          <span className="k">Katılım</span>
          <span className="v">Üye olmak yeterli — üyelik ücretsiz, tek tıkla katıl.</span>
          <span className="k">Kura</span>
          <span className="v">Süre bitince yetkili panelden kura çekilir, sonuç duyurulur.</span>
          <span className="k">Teslim</span>
          <span className="v">Ödül kazanan hesabına anında teslim edilir.</span>
        </div>
      </div>
    </section>
  );
}
