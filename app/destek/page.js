'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSite } from '@/components/SiteProvider';
import Title from '@/components/Title';
import { api, dateTR } from '@/lib/client';
import { Empty, RoleBadge } from '@/lib/ui';

const DEPTS = ['Genel Destek', 'Satın Alım & Ödeme', 'Bypass & Spoofer Sorunu', 'Hata Bildiri (Bug Report)', 'Booster Özel Talebi'];
const PRIOS = ['Normal', 'Yüksek', 'Acil'];
const STATUS = { open: 'Açık', answered: 'Yanıtlandı', closed: 'Kapalı' };

export default function SupportPage() {
  const { user, notify } = useSite();
  const [dept, setDept] = useState(DEPTS[0]);
  const [prio, setPrio] = useState('Normal');
  const [message, setMessage] = useState('');
  const [tickets, setTickets] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const load = () => {
    if (!user) return;
    api('tickets')
      .then((d) => setTickets(d.tickets))
      .catch((e) => setErr(e.message));
  };

  useEffect(load, [user]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await api('tickets', { method: 'POST', body: { dept, priority: prio, message } });
      notify('Bilet oluşturuldu, ekibimiz en kısa sürede dönecek.');
      setMessage('');
      load();
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  };

  const sendReply = async (id) => {
    if (!reply.trim()) return;
    try {
      await api('tickets/reply', { method: 'POST', body: { id, text: reply } });
      setReply('');
      load();
    } catch (e) {
      notify(e.message, 'err');
    }
  };

  if (!user) {
    return (
      <section className="sec wrap">
        <div className="card" style={{ textAlign: 'center', padding: 46 }}>
          <div style={{ fontSize: 42 }}>🎫</div>
          <h1 className="sec-title">Destek Biletleri</h1>
          <p className="sec-sub" style={{ margin: '12px auto 24px' }}>
            Bilet oluşturmak ve yanıtları takip etmek için giriş yapmalısın.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link href="/giris" className="btn btn-gold">
              Giriş Yap
            </Link>
            <Link href="/kayit" className="btn">
              Kayıt Ol
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="sec wrap">
      <Title>Destek</Title>
      <div className="sec-head">
        <div>
          <span className="kicker">Destek / Ticket</span>
          <h1 className="sec-title">Bilet Oluştur</h1>
          <p className="sec-sub">7/24 aktif destek — talebin yetkililerimize doğrudan iletilir.</p>
        </div>
        <span className="pill green">Ort. yanıt &lt; 15 dk</span>
      </div>

      <div className="split">
        <form className="card" onSubmit={submit}>
          {err && <div className="err">{err}</div>}
          <div className="field">
            <label>Departman / Konu</label>
            <select value={dept} onChange={(e) => setDept(e.target.value)}>
              {DEPTS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Öncelik Derecesi</label>
            <select value={prio} onChange={(e) => setPrio(e.target.value)}>
              {PRIOS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Mesajın</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Sorunu, sipariş numaranı ve talebini yaz..."
              required
            />
          </div>
          <button className="btn btn-gold btn-block" disabled={busy}>
            {busy ? 'Gönderiliyor...' : 'Bileti Gönder'}
          </button>
          <p className="form-note">Mesajın en az 10 karakter olmalı.</p>
        </form>

        <div>
          <div className="sec-head" style={{ marginBottom: 14 }}>
            <h2 style={{ fontSize: 20 }}>Biletlerim ({tickets.length})</h2>
            <button className="btn btn-sm" onClick={load}>
              ↻ Yenile
            </button>
          </div>

          {tickets.length === 0 ? (
            <Empty icon="🎫" text="Henüz biletin yok." />
          ) : (
            tickets.map((t) => (
              <div className="card" key={t.id} style={{ padding: 18, marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <b>{t.dept}</b>
                  <span className={`pill ${t.priority === 'Acil' ? 'gold' : ''}`}>{t.priority}</span>
                  <span className="pill">
                    <span className={`badge-dot dot-${t.status}`} />
                    {STATUS[t.status]}
                  </span>
                  <span className="mut" style={{ marginLeft: 'auto', fontSize: 12.5 }}>
                    {dateTR(t.createdAt)}
                  </span>
                </div>

                <div style={{ marginTop: 12 }}>
                  {t.messages.map((m, i) => (
                    <div className={`ticket-msg ${m.role && m.role !== 'member' ? 'staff' : 'user'}`} key={i}>
                      <div className="who">
                        {m.from} {m.role && m.role !== 'member' ? `· ${m.role}` : ''} · {dateTR(m.at)}
                      </div>
                      {m.text}
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <input
                    className="inp"
                    style={{ flex: 1 }}
                    placeholder="Yanıt yaz..."
                    value={openId === t.id ? reply : ''}
                    onChange={(e) => {
                      setOpenId(t.id);
                      setReply(e.target.value);
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && sendReply(t.id)}
                  />
                  <button className="btn btn-sm btn-violet" onClick={() => sendReply(t.id)}>
                    Gönder
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
