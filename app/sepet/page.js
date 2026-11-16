'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSite } from '@/components/SiteProvider';
import { api, money } from '@/lib/client';
import { CATEGORY_GRAD, Empty } from '@/lib/ui';

export default function CartPage() {
  const { cart, cartSet, cartClear, user, notify, reloadBoot } = useSite();
  const router = useRouter();
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const checkout = async () => {
    if (!user) {
      notify('Ödeme için giriş yapmalısın.', 'err');
      return router.push('/giris');
    }
    setBusy(true);
    try {
      const d = await api('orders', {
        method: 'POST',
        body: { items: cart.map((i) => ({ id: i.id, qty: i.qty })), note }
      });
      cartClear();
      reloadBoot();
      notify(d.order.status === 'paid' ? 'Sipariş alındı — teslimat hazır!' : 'Sipariş alındı, onay bekleniyor.');
      router.push('/hesap?tab=orders');
    } catch (e) {
      notify(e.message, 'err');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="sec wrap">
      <div className="sec-head">
        <div>
          <span className="kicker">Sepetim</span>
          <h1 className="sec-title">Alışveriş Sepeti</h1>
        </div>
        <Link href="/magaza" className="btn btn-sm">
          Alışverişe Devam
        </Link>
      </div>

      {cart.length === 0 ? (
        <Empty icon="🛒" text="Sepetin boş." />
      ) : (
        <div className="cart-grid">
          <div>
            {cart.map((i) => (
              <div className="cart-row" key={i.id}>
                <div className="thumb" style={{ background: CATEGORY_GRAD[i.category] || CATEGORY_GRAD.valorant }}>
                  {i.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="info">
                  <b>{i.name}</b>
                  <span>{money(i.price)} / adet</span>
                </div>
                <div className="qty">
                  <button onClick={() => cartSet(i.id, i.qty - 1)}>−</button>
                  <span>{i.qty}</span>
                  <button onClick={() => cartSet(i.id, Math.min(99, i.qty + 1))}>+</button>
                </div>
                <b style={{ minWidth: 90, textAlign: 'right' }}>{money(i.price * i.qty)}</b>
                <button className="btn btn-sm btn-danger" onClick={() => cartSet(i.id, 0)}>
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 12 }}>Sipariş Özeti</h3>
            <div className="sum-row">
              <span className="mut">Ara toplam</span>
              <span>{money(total)}</span>
            </div>
            <div className="sum-row">
              <span className="mut">Teslimat</span>
              <span style={{ color: 'var(--green)' }}>Anında / Ücretsiz</span>
            </div>
            <div className="sum-row total">
              <span>TOPLAM</span>
              <span className="gold">{money(total)}</span>
            </div>

            <div className="field" style={{ marginTop: 14 }}>
              <label>Sipariş Notu (opsiyonel)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={{ minHeight: 70 }}
                placeholder="Discord kullanıcı adın, özel istekler..."
              />
            </div>

            <button className="btn btn-gold btn-block" onClick={checkout} disabled={busy}>
              {busy ? 'Gönderiliyor...' : 'SİPARİŞİ TAMAMLA'}
            </button>
            <p className="form-note">
              {user
                ? 'Ücretsiz ürünler anında teslim edilir; ödemeli siparişler onay sonrası açılır.'
                : 'Ödeme adımında giriş yapman gerekecek.'}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
