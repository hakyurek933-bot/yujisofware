'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSite } from '@/components/SiteProvider';
import { api, money, dateTR } from '@/lib/client';
import { Empty, RoleBadge, Stars } from '@/lib/ui';

const STAFF = ['owner', 'founder', 'admin', 'moderator'];
const OWNER = ['owner', 'founder'];
const ROLES = ['member', 'booster', 'sponsor', 'moderator', 'admin', 'founder', 'owner'];
const ORDER_STATUS = { pending: 'Onay Bekliyor', paid: 'Ödendi', cancelled: 'İptal' };
const TSTATUS = { open: 'Açık', answered: 'Yanıtlandı', closed: 'Kapalı' };

const emptyProduct = {
  name: '',
  category: 'valorant',
  type: 'Yazılım',
  price: 0,
  description: '',
  guide: '',
  image: '',
  youtube: '',
  download: '',
  virustotal: '',
  stock: 100,
  minRole: '',
  featured: false,
  active: true
};

export default function AdminPage() {
  const { user, setUser, notify, reloadBoot } = useSite();
  const router = useRouter();
  const [tab, setTab] = useState('dash');
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [anns, setAnns] = useState([]);
  const [giveaways, setGiveaways] = useState([]);
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);

  const isOwner = user && OWNER.includes(user.role);

  useEffect(() => {
    if (!user) {
      router.push('/giris');
      return;
    }
    if (!STAFF.includes(user.role)) {
      router.push('/');
      return;
    }
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const refresh = async () => {
    try {
      const [st, pr, us, or, rv, tk, bo, gw] = await Promise.all([
        api('admin/stats'),
        api('products'),
        api('admin/users'),
        api('orders?all=1'),
        api('reviews?all=1'),
        api('tickets?all=1'),
        api('bootstrap'),
        api('giveaways')
      ]);
      setStats(st.stats);
      setProducts(pr.products);
      setCategories(pr.categories);
      setUsers(us.users);
      setOrders(or.orders);
      setReviews(rv.reviews);
      setTickets(tk.tickets);
      setAnns(bo.announcements);
      setSettings(bo.settings);
      setGiveaways(gw.giveaways);
    } catch (e) {
      notify(e.message, 'err');
    }
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api('admin/products', { method: 'POST', body: { ...form, id: editing } });
      notify(editing ? 'Ürün güncellendi.' : 'Ürün yayınlandı.');
      setForm(emptyProduct);
      setEditing(null);
      await refresh();
      reloadBoot();
    } catch (e2) {
      notify(e2.message, 'err');
    } finally {
      setBusy(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm('Ürün silinsin mi?')) return;
    try {
      await api('admin/products/delete', { method: 'POST', body: { id } });
      notify('Ürün silindi.');
      await refresh();
      reloadBoot();
    } catch (e) {
      notify(e.message, 'err');
    }
  };

  const setRole = async (id, role) => {
    try {
      await api('admin/users', { method: 'POST', body: { id, role } });
      notify('Rol güncellendi.');
      refresh();
    } catch (e) {
      notify(e.message, 'err');
      refresh();
    }
  };

  const setBan = async (u) => {
    const reason = u.banned ? '' : prompt('Ban sebebi:') || 'Sebep belirtilmedi';
    try {
      await api('admin/users', { method: 'POST', body: { id: u.id, banned: !u.banned, banReason: reason } });
      notify(u.banned ? 'Ban kaldırıldı.' : 'Kullanıcı banlandı.');
      refresh();
    } catch (e) {
      notify(e.message, 'err');
      refresh();
    }
  };

  const setOrderStatus = async (id, status) => {
    try {
      await api('orders/status', { method: 'POST', body: { id, status } });
      notify('Sipariş durumu güncellendi.');
      refresh();
    } catch (e) {
      notify(e.message, 'err');
    }
  };

  const moderate = async (id, status) => {
    try {
      await api('reviews/moderate', { method: 'POST', body: { id, status } });
      notify('Yorum durumu güncellendi.');
      refresh();
      reloadBoot();
    } catch (e) {
      notify(e.message, 'err');
    }
  };

  const ticketStatus = async (id, status) => {
    try {
      await api('tickets/status', { method: 'POST', body: { id, status } });
      refresh();
    } catch (e) {
      notify(e.message, 'err');
    }
  };

  const saveAnn = async (e) => {
    e.preventDefault();
    try {
      await api('admin/announcements', {
        method: 'POST',
        body: { title: e.target.title.value, body: e.target.body.value, active: e.target.active.checked }
      });
      notify('Duyuru yayınlandı.');
      e.target.reset();
      refresh();
      reloadBoot();
    } catch (err) {
      notify(err.message, 'err');
    }
  };

  const saveGiveaway = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const ends = fd.get('endsAt');
    const endsAt = ends ? new Date(ends).getTime() : Date.now() + 86400000;
    try {
      await api('admin/giveaways', {
        method: 'POST',
        body: {
          title: fd.get('title'),
          prize: fd.get('prize'),
          description: fd.get('description'),
          endsAt
        }
      });
      notify('Çekiliş oluşturuldu.');
      e.target.reset();
      refresh();
    } catch (err) {
      notify(err.message, 'err');
    }
  };

  const rollGiveaway = async (id) => {
    try {
      const d = await api('admin/giveaways/roll', { method: 'POST', body: { id } });
      notify(d.winner ? `Kazanan: ${d.winner} 🎉` : 'Katılım yok, kura boş döndü.');
      refresh();
    } catch (e) {
      notify(e.message, 'err');
    }
  };

  const reopenGiveaway = async (id) => {
    try {
      await api('admin/giveaways', { method: 'POST', body: { id, reopen: true } });
      notify('Çekiliş yeniden açıldı.');
      refresh();
    } catch (e) {
      notify(e.message, 'err');
    }
  };

  const delGiveaway = async (id) => {
    if (!confirm('Çekiliş silinsin mi?')) return;
    try {
      await api('admin/giveaways/delete', { method: 'POST', body: { id } });
      notify('Çekiliş silindi.');
      refresh();
    } catch (e) {
      notify(e.message, 'err');
    }
  };

  const syncCategories = async () => {
    try {
      await api('admin/categories/sync', { method: 'POST', body: {} });
      notify('Kategoriler güncellendi.');
      refresh();
      reloadBoot();
    } catch (e) {
      notify(e.message, 'err');
    }
  };

  const resetData = async () => {
    if (!confirm('TÜM VERİLER silinip fabrika ayarlarına dönecek. Emin misin?')) return;
    try {
      await api('admin/reset', { method: 'POST', body: {} });
      notify('Fabrika ayarları yüklendi.');
      setUser(null);
      router.push('/giris');
    } catch (e) {
      notify(e.message, 'err');
    }
  };

  const delAnn = async (id) => {
    try {
      await api('admin/announcements/delete', { method: 'POST', body: { id } });
      refresh();
      reloadBoot();
    } catch (e) {
      notify(e.message, 'err');
    }
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData(e.target);
      const body = {};
      fd.forEach((v, k) => (body[k] = v));
      await api('admin/settings', { method: 'POST', body });
      notify('Ayarlar kaydedildi.');
      reloadBoot();
    } catch (err) {
      notify(err.message, 'err');
    }
  };

  if (!user || !STAFF.includes(user.role)) return null;

  const filteredProducts = products.filter((p) =>
    search ? (p.name + p.category + p.type).toLowerCase().includes(search.toLowerCase()) : true
  );

  const TABS = [
    ['dash', '📊 Panel'],
    ['products', '🛒 Ürünler'],
    ['orders', '📦 Siparişler'],
    ['users', '👥 Kullanıcılar & Roller'],
    ['reviews', '⭐ Yorumlar'],
    ['tickets', '🎫 Biletler'],
    ['giveaways', '🎉 Çekiliş'],
    ['anns', '📢 Duyurular'],
    ...(isOwner ? [['settings', '⚙️ Ayarlar']] : [])
  ];

  return (
    <section className="sec wrap">
      <div className="sec-head">
        <div>
          <span className="kicker">Yetkili Paneli</span>
          <h1 className="sec-title">Yujisofware Admin</h1>
          <p className="sec-sub">
            Giriş: {user.username} · <RoleBadge role={user.role} />
          </p>
        </div>
        <button className="btn btn-sm" onClick={refresh}>
          ↻ Yenile
        </button>
      </div>

      <div className="tabs">
        {TABS.map(([id, label]) => (
          <button key={id} className={`tab ${tab === id ? 'on' : ''}`} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'dash' && stats && (
        <div className="stat-grid">
          <div className="stat">
            <b>{stats.users}</b>
            <span>Toplam Üye</span>
          </div>
          <div className="stat">
            <b>{stats.products}</b>
            <span>Ürün</span>
          </div>
          <div className="stat">
            <b>{stats.paid}/{stats.orders}</b>
            <span>Onaylı / Toplam Sipariş</span>
          </div>
          <div className="stat">
            <b>{money(stats.revenue)}</b>
            <span>Toplam Ciro</span>
          </div>
          <div className="stat">
            <b>{stats.openTickets}</b>
            <span>Açık Bilet</span>
          </div>
          <div className="stat">
            <b>{stats.pendingReviews}</b>
            <span>Bekleyen Yorum</span>
          </div>
          <div className="stat">
            <b>{stats.banned}</b>
            <span>Banlı Hesap</span>
          </div>
          <div className="stat">
            <b>{users.filter((u) => STAFF.includes(u.role)).length}</b>
            <span>Yetkili</span>
          </div>
        </div>
      )}

      {tab === 'products' && (
        <div className="split">
          <form className="card" onSubmit={saveProduct}>
            <h3 style={{ marginBottom: 14 }}>{editing ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}</h3>
            <div className="field">
              <label>Ürün Adı *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="row">
              <div className="field">
                <label>Kategori</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Tür</label>
                <input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
              </div>
            </div>
            <div className="row">
              <div className="field">
                <label>Fiyat (0 = Ücretsiz)</label>
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                />
              </div>
              <div className="field">
                <label>Stok</label>
                <input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="field">
              <label>Erişim Rolü (opsiyonel)</label>
              <select value={form.minRole} onChange={(e) => setForm({ ...form, minRole: e.target.value })}>
                <option value="">Herkes</option>
                <option value="booster">Booster ve üstü</option>
                <option value="sponsor">Sponsor ve üstü</option>
              </select>
            </div>
            <div className="field">
              <label>Açıklama &amp; Kullanım Rehberi</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="field">
              <label>Kod / Komut Bloğu (opsiyonel)</label>
              <textarea
                value={form.guide}
                onChange={(e) => setForm({ ...form, guide: e.target.value })}
                style={{ minHeight: 80, fontFamily: 'monospace' }}
              />
            </div>
            <div className="field">
              <label>YouTube Linki</label>
              <input value={form.youtube} onChange={(e) => setForm({ ...form, youtube: e.target.value })} placeholder="https://youtube.com/..." />
            </div>
            <div className="field">
              <label>İndirme Linki</label>
              <input value={form.download} onChange={(e) => setForm({ ...form, download: e.target.value })} placeholder="https://..." />
            </div>
            <div className="field">
              <label>VirusTotal Linki</label>
              <input value={form.virustotal} onChange={(e) => setForm({ ...form, virustotal: e.target.value })} placeholder="https://virustotal.com/..." />
            </div>
            <div className="row">
              <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 14 }}>
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                Öne çıkar
              </label>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 14 }}>
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                Yayında
              </label>
            </div>
            <button className="btn btn-gold btn-block" disabled={busy} style={{ marginTop: 14 }}>
              {busy ? 'Kaydediliyor...' : editing ? 'GÜNCELLE' : 'ÜRÜNÜ YAYINLA'}
            </button>
            {editing && (
              <button
                type="button"
                className="btn btn-block"
                style={{ marginTop: 8 }}
                onClick={() => {
                  setEditing(null);
                  setForm(emptyProduct);
                }}
              >
                Vazgeç
              </button>
            )}
          </form>

          <div>
            <input
              className="search"
              style={{ maxWidth: '100%', marginBottom: 14 }}
              placeholder="🔍 Ürünlerde ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Ürün</th>
                    <th>Kategori</th>
                    <th>Fiyat</th>
                    <th>Rol</th>
                    <th>Durum</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <b>{p.name}</b>
                        <div className="mut" style={{ fontSize: 12 }}>
                          {p.type}
                        </div>
                      </td>
                      <td>{p.category.toUpperCase()}</td>
                      <td className="gold">{money(p.price)}</td>
                      <td>{p.minRole ? <RoleBadge role={p.minRole} /> : <span className="mut">Herkes</span>}</td>
                      <td>
                        <span className={`badge-dot ${p.active ? 'dot-paid' : 'dot-closed'}`} />
                        {p.active ? 'Yayında' : 'Pasif'}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <button
                          className="btn btn-sm"
                          onClick={() => {
                            setEditing(p.id);
                            setForm({ ...emptyProduct, ...p, minRole: p.minRole || '' });
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        >
                          Düzenle
                        </button>{' '}
                        <button className="btn btn-sm btn-danger" onClick={() => deleteProduct(p.id)}>
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredProducts.length === 0 && <Empty icon="🛒" text="Ürün yok." />}
            </div>
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Sipariş</th>
                <th>Üye</th>
                <th>Ürünler</th>
                <th>Tutar</th>
                <th>Durum</th>
                <th>Tarih</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 12.5 }}>{o.id}</td>
                  <td>{o.username}</td>
                  <td>
                    {o.items.map((i) => (
                      <div key={i.productId} style={{ fontSize: 13 }}>
                        {i.name} × {i.qty}
                      </div>
                    ))}
                  </td>
                  <td className="gold">{money(o.total)}</td>
                  <td>
                    <span className={`badge-dot dot-${o.status}`} />
                    {ORDER_STATUS[o.status]}
                  </td>
                  <td className="mut" style={{ fontSize: 12.5 }}>
                    {dateTR(o.createdAt)}
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {o.status !== 'paid' && (
                      <button className="btn btn-sm btn-gold" onClick={() => setOrderStatus(o.id, 'paid')}>
                        Onayla
                      </button>
                    )}{' '}
                    {o.status !== 'cancelled' && (
                      <button className="btn btn-sm btn-danger" onClick={() => setOrderStatus(o.id, 'cancelled')}>
                        İptal
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <Empty icon="📦" text="Sipariş yok." />}
        </div>
      )}

      {tab === 'users' && (
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Kullanıcı</th>
                <th>Rol</th>
                <th>Harcanan</th>
                <th>Son Giriş</th>
                <th>Durum</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <b>{u.username}</b>
                    <div className="mut" style={{ fontSize: 12 }}>
                      {u.email}
                    </div>
                  </td>
                  <td>
                    {isOwner || !['owner', 'founder'].includes(u.role) ? (
                      <select
                        value={u.role}
                        onChange={(e) => setRole(u.id, e.target.value)}
                        style={{
                          background: '#0d0d17',
                          border: '1px solid var(--line)',
                          borderRadius: 8,
                          padding: '5px 8px',
                          fontSize: 13
                        }}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <RoleBadge role={u.role} />
                    )}
                  </td>
                  <td>{money(u.spend)}</td>
                  <td className="mut" style={{ fontSize: 12.5 }}>
                    {u.lastLogin ? dateTR(u.lastLogin) : '—'}
                  </td>
                  <td>
                    {u.banned ? (
                      <span style={{ color: 'var(--red)', fontSize: 13 }}>⛔ {u.banReason || 'banlı'}</span>
                    ) : (
                      <span style={{ color: 'var(--green)', fontSize: 13 }}>● Aktif</span>
                    )}
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button className={`btn btn-sm ${u.banned ? '' : 'btn-danger'}`} onClick={() => setBan(u)}>
                      {u.banned ? 'Banı Kaldır' : 'Banla'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'reviews' && (
        <div className="rev-grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))' }}>
          {reviews.map((r) => (
            <div className="rev" key={r.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Stars n={r.rating} />
                <span className={`pill ${r.status === 'approved' ? 'green' : ''}`}>{r.status}</span>
              </div>
              <p>{r.text}</p>
              <div className="rev-who">
                <span className="avatar">{(r.user || '?')[0].toUpperCase()}</span>
                <b>{r.user}</b>
                <span className="rev-cat">{r.category}</span>
                <span className="mut" style={{ marginLeft: 'auto', fontSize: 12 }}>
                  {dateTR(r.createdAt)}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {r.status !== 'approved' && (
                  <button className="btn btn-sm btn-gold" onClick={() => moderate(r.id, 'approved')}>
                    Onayla
                  </button>
                )}
                {r.status !== 'rejected' && (
                  <button className="btn btn-sm btn-danger" onClick={() => moderate(r.id, 'rejected')}>
                    Reddet
                  </button>
                )}
              </div>
            </div>
          ))}
          {reviews.length === 0 && <Empty icon="⭐" text="Yorum yok." />}
        </div>
      )}

      {tab === 'tickets' && (
        <div>
          {tickets.length === 0 && <Empty icon="🎫" text="Bilet yok." />}
          {tickets.map((t) => (
            <div className="card" key={t.id} style={{ marginBottom: 12, padding: 18 }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <b>{t.dept}</b>
                <span className="pill">{t.username}</span>
                <span className="pill">{t.priority}</span>
                <span className="pill">
                  <span className={`badge-dot dot-${t.status}`} />
                  {TSTATUS[t.status]}
                </span>
                <span className="mut" style={{ marginLeft: 'auto', fontSize: 12.5 }}>
                  {dateTR(t.createdAt)}
                </span>
              </div>
              <div style={{ marginTop: 12 }}>
                {t.messages.map((m, i) => (
                  <div className={`ticket-msg ${STAFF.includes(m.role) ? 'staff' : 'user'}`} key={i}>
                    <div className="who">
                      {m.from} {m.role ? `· ${m.role}` : ''} · {dateTR(m.at)}
                    </div>
                    {m.text}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                {t.status !== 'answered' && (
                  <button className="btn btn-sm" onClick={() => ticketStatus(t.id, 'answered')}>
                    Yanıtlandı İşaretle
                  </button>
                )}
                {t.status !== 'closed' && (
                  <button className="btn btn-sm btn-danger" onClick={() => ticketStatus(t.id, 'closed')}>
                    Kapat
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'giveaways' && (
        <div className="split">
          <form className="card" onSubmit={saveGiveaway}>
            <h3 style={{ marginBottom: 14 }}>Yeni Çekiliş</h3>
            <div className="field">
              <label>Başlık</label>
              <input name="title" required placeholder="Örn: Haftalık Araç Çekilişi" />
            </div>
            <div className="field">
              <label>Ödül</label>
              <input name="prize" required placeholder="Örn: 1 aylık tüm araçlara erişim" />
            </div>
            <div className="field">
              <label>Açıklama</label>
              <textarea name="description" placeholder="Katılım koşulları, teslimat şekli..." />
            </div>
            <div className="field">
              <label>Bitiş Zamanı</label>
              <input
                type="datetime-local"
                name="endsAt"
                defaultValue={new Date(Date.now() + 86400000).toISOString().slice(0, 16)}
              />
            </div>
            <button className="btn btn-gold btn-block">Çekilişi Oluştur</button>
          </form>

          <div>
            {giveaways.length === 0 ? (
              <Empty icon="🎁" text="Çekiliş yok." />
            ) : (
              giveaways.map((g) => (
                <div className="card" key={g.id} style={{ marginBottom: 10, padding: 16 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <b>{g.title}</b>
                    <span className={`pill ${g.status === 'active' ? 'green' : ''}`}>{g.status}</span>
                    <span className="pill">👥 {g.entryCount}</span>
                    <span className="mut" style={{ marginLeft: 'auto', fontSize: 12.5 }}>
                      {new Date(g.endsAt).toLocaleString('tr-TR')}
                    </span>
                  </div>
                  <div style={{ marginTop: 6, fontSize: 14 }}>
                    Ödül: <b className="gold">{g.prize}</b>
                    {g.winner ? (
                      <span style={{ marginLeft: 10 }}>
                        Kazanan: <b style={{ color: 'var(--gold)' }}>🏆 {g.winner}</b>
                      </span>
                    ) : null}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                    <button className="btn btn-sm btn-gold" onClick={() => rollGiveaway(g.id)}>
                      🎲 Kura Çek
                    </button>
                    {g.status !== 'active' && (
                      <button className="btn btn-sm" onClick={() => reopenGiveaway(g.id)}>
                        Yeniden Aç
                      </button>
                    )}
                    <button className="btn btn-sm btn-danger" onClick={() => delGiveaway(g.id)}>
                      Sil
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {tab === 'anns' && (
        <div className="split">
          <form className="card" onSubmit={saveAnn}>
            <h3 style={{ marginBottom: 14 }}>Yeni Duyuru</h3>
            <div className="field">
              <label>Başlık</label>
              <input name="title" required placeholder="Örn: Yeni ürünler yayında" />
            </div>
            <div className="field">
              <label>İçerik</label>
              <textarea name="body" required placeholder="Duyuru metni..." />
            </div>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 14, marginBottom: 14 }}>
              <input type="checkbox" name="active" defaultChecked />
              Aktif (sitede görünsün)
            </label>
            <button className="btn btn-gold btn-block">Duyuruyu Yayınla</button>
          </form>

          <div>
            {anns.length === 0 ? (
              <Empty icon="📢" text="Duyuru yok." />
            ) : (
              anns.map((a) => (
                <div className="card" key={a.id} style={{ marginBottom: 10, padding: 16 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <b>{a.title}</b>
                    <span className={`pill ${a.active ? 'green' : ''}`}>{a.active ? 'Aktif' : 'Pasif'}</span>
                    <span className="mut" style={{ marginLeft: 'auto', fontSize: 12 }}>
                      {dateTR(a.createdAt)}
                    </span>
                    <button className="btn btn-sm btn-danger" onClick={() => delAnn(a.id)}>
                      Sil
                    </button>
                  </div>
                  <p className="mut" style={{ fontSize: 13.5, marginTop: 6 }}>
                    {a.body}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {tab === 'settings' && isOwner && settings && (
        <form className="card" style={{ maxWidth: 640 }} onSubmit={saveSettings}>
          <h3 style={{ marginBottom: 16 }}>Site Ayarları</h3>
          <div className="field">
            <label>Site Adı</label>
            <input name="siteName" defaultValue={settings.siteName} />
          </div>
          <div className="field">
            <label>Slogan</label>
            <input name="tagline" defaultValue={settings.tagline} />
          </div>
          <div className="field">
            <label>Hero Başlık</label>
            <input name="heroTitle" defaultValue={settings.heroTitle} />
          </div>
          <div className="field">
            <label>Hero Alt Metin</label>
            <input name="heroSub" defaultValue={settings.heroSub} />
          </div>
          <div className="field">
            <label>Discord Davet Linki</label>
            <input name="discord" defaultValue={settings.discord} />
          </div>
          <div className="field">
            <label>E-Posta</label>
            <input name="email" defaultValue={settings.email} />
          </div>
          <div className="field">
            <label>Para Birimi</label>
            <input name="currency" defaultValue={settings.currency} />
          </div>
          <button className="btn btn-gold">Ayarları Kaydet</button>
        </form>
      )}

      {tab === 'settings' && isOwner && (
        <div className="card" style={{ maxWidth: 640, marginTop: 18 }}>
          <h3 style={{ marginBottom: 6 }}>Bakım</h3>
          <p className="form-note" style={{ marginBottom: 16 }}>
            Kategorileri güncellemek AI kategorisini kaldırır ve Minecraft / Roblox / Fortnite ekler. Fabrika ayarları
            tüm verileri siler ve başlangıç haline döndürür.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn" onClick={syncCategories}>
              ↻ Kategorileri Güncelle
            </button>
            <button className="btn btn-danger" onClick={resetData}>
              ♻ Fabrika Ayarlarına Dön
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
