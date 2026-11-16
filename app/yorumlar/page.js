'use client';

import { useState } from 'react';
import { useSite } from '@/components/SiteProvider';
import { api } from '@/lib/client';
import { Stars, Empty } from '@/lib/ui';

const CATS = ['Genel Düşünce', 'Öneri & İstek', 'Deneyim & Yorum', 'Memnuniyet', 'Booster Görüşü'];
const CAT_IDS = ['genel', 'oneri', 'deneyim', 'memnuniyet', 'booster'];

export default function ReviewsPage() {
  const { boot, user, notify, reloadBoot } = useSite();
  const reviews = boot?.reviews || [];
  const [cat, setCat] = useState('all');
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  const list = cat === 'all' ? reviews : reviews.filter((r) => r.category === cat);

  const submit = async (e) => {
    e.preventDefault();
    if (!user) return notify('Yorum yazmak için giriş yapmalısın.', 'err');
    setBusy(true);
    try {
      await api('reviews', { method: 'POST', body: { category: cat === 'all' ? 'genel' : cat, rating, text } });
      notify('Yorumun alındı — yetkili onayından sonra yayınlanacak.');
      setText('');
      reloadBoot();
    } catch (e2) {
      notify(e2.message, 'err');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="sec wrap">
      <div className="sec-head">
        <div>
          <span className="kicker">Topluluk Duvarı</span>
          <h1 className="sec-title">Üye Düşünceleri &amp; Geri Bildirim</h1>
          <p className="sec-sub">Deneyimini paylaş, önerini yaz — hepsi topluluk duvarında görünür.</p>
        </div>
        <span className="pill gold">Toplam {reviews.length} düşünce</span>
      </div>

      <div className="split">
        <form className="card" onSubmit={submit}>
          <h3 style={{ marginBottom: 14 }}>Düşünceni Paylaş</h3>
          <div className="field">
            <label>Kategori</label>
            <select
              value={cat === 'all' ? 'genel' : cat}
              onChange={(e) => setCat(e.target.value)}
            >
              {CATS.map((c, i) => (
                <option key={c} value={CAT_IDS[i]}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Puan</label>
            <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {'⭐'.repeat(n)} ({n})
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Yorumun</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ürünü, teslimatı ve desteği nasıl buldun?"
              required
            />
          </div>
          <button className="btn btn-gold btn-block" disabled={busy}>
            {busy ? 'Gönderiliyor...' : 'Düşünceni Gönder'}
          </button>
          <p className="form-note">
            {user ? 'Yorumların yetkili onayından sonra yayınlanır.' : 'Giriş yaparak yazabilirsin.'}
          </p>
        </form>

        <div>
          <div className="filters">
            <button className={`filt ${cat === 'all' ? 'on' : ''}`} onClick={() => setCat('all')}>
              Tümü
            </button>
            {CATS.map((c, i) => (
              <button key={c} className={`filt ${cat === CAT_IDS[i] ? 'on' : ''}`} onClick={() => setCat(CAT_IDS[i])}>
                {c}
              </button>
            ))}
          </div>

          {list.length === 0 ? (
            <Empty icon="💭" text="Bu kategoride henüz onaylı yorum yok." />
          ) : (
            <div className="rev-grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))' }}>
              {list.map((r) => (
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
        </div>
      </div>
    </section>
  );
}
