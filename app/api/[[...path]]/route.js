import bcrypt from 'bcryptjs';
import { load, mutate } from '@/lib/db';
import { CATEGORIES, seedState } from '@/lib/seed';
import {
  currentUser,
  createSession,
  clearSession,
  hashPassword,
  verifyPassword,
  isStaff,
  isOwner
} from '@/lib/auth';
import {
  uid,
  slugify,
  json,
  pub,
  roleAtLeast,
  validUsername,
  validEmail,
  weakPassword
} from '@/lib/util';

const ok = (data) => json(data);
const bad = (msg, status = 400) => json({ error: msg }, { status });
const deny = () => json({ error: 'Bu işlem için yetkin yok.' }, { status: 403 });
const need = (msg, status = 401) => json({ error: msg }, { status });

async function requireUser() {
  const u = await currentUser();
  if (!u) return { user: null, err: need('Önce giriş yapmalısın.') };
  return { user: u, err: null };
}

async function requireStaff() {
  const u = await currentUser();
  if (!u) return { user: null, err: need('Önce giriş yapmalısın.') };
  if (!isStaff(u)) return { user: null, err: deny() };
  return { user: u, err: null };
}

async function requireOwner() {
  const u = await currentUser();
  if (!u) return { user: null, err: need('Önce giriş yapmalısın.') };
  if (!isOwner(u)) return { user: null, err: deny() };
  return { user: u, err: null };
}

const activeProducts = (db) => db.products.filter((p) => p.active);
const approvedReviews = (db) =>
  db.reviews.filter((r) => r.status === 'approved').sort((a, b) => b.createdAt - a.createdAt);

function publicProduct(p) {
  const { ...rest } = p;
  return rest;
}

async function handle(method, parts, query, body) {
  const p = parts.join('/');

  // ---------- GET ----------
  if (method === 'GET') {
    if (p === '' || p === 'bootstrap') {
      const db = await load();
      const me = await currentUser();
      const now = Date.now();
      return ok({
        settings: db.settings,
        categories: db.categories,
        announcements: db.announcements.filter((a) => a.active).sort((a, b) => b.createdAt - a.createdAt),
        products: activeProducts(db).map(publicProduct),
        reviews: approvedReviews(db),
        giveaways: (db.giveaways || [])
          .map((g) => ({
            id: g.id,
            title: g.title,
            prize: g.prize,
            description: g.description || '',
            endsAt: g.endsAt,
            status: g.status === 'active' && g.endsAt <= now ? 'waiting' : g.status,
            winner: g.winnerId ? db.users.find((u) => u.id === g.winnerId)?.username || '' : '',
            entryCount: (g.entries || []).length,
            joined: me ? (g.entries || []).includes(me.id) : false,
            createdAt: g.createdAt
          }))
          .sort((a, b) => b.createdAt - a.createdAt),
        stats: {
          products: activeProducts(db).length,
          members: db.users.length,
          orders: db.orders.filter((o) => o.status === 'paid').length
        }
      });
    }

    if (p === 'giveaways') {
      const db = await load();
      const me = await currentUser();
      return ok({
        giveaways: (db.giveaways || [])
          .map((g) => ({
            id: g.id,
            title: g.title,
            prize: g.prize,
            description: g.description || '',
            endsAt: g.endsAt,
            status: g.status === 'active' && g.endsAt <= Date.now() ? 'waiting' : g.status,
            winner: g.winnerId ? db.users.find((u) => u.id === g.winnerId)?.username || '' : '',
            entryCount: (g.entries || []).length,
            joined: me ? (g.entries || []).includes(me.id) : false,
            createdAt: g.createdAt
          }))
          .sort((a, b) => b.createdAt - a.createdAt)
      });
    }

    if (p === 'me') {
      const u = await currentUser();
      return ok({ user: pub(u) });
    }

    if (p === 'products') {
      const db = await load();
      const { user } = await requireStaff();
      const list = user ? db.products : activeProducts(db);
      return ok({ products: list.map(publicProduct), categories: db.categories });
    }

    if (p === 'reviews') {
      const db = await load();
      if (query.get('all') && isStaff(await currentUser())) {
        return ok({ reviews: [...db.reviews].sort((a, b) => b.createdAt - a.createdAt) });
      }
      return ok({ reviews: approvedReviews(db) });
    }

    if (p === 'orders') {
      const { user, err } = await requireUser();
      if (err) return err;
      const db = await load();
      const all = query.get('all') && isStaff(user);
      const orders = db.orders
        .filter((o) => all || o.userId === user.id)
        .sort((a, b) => b.createdAt - a.createdAt)
        .map((o) => ({
          ...o,
          downloadReady: o.status === 'paid',
          items: o.items.map((it) => ({ ...it, download: o.status === 'paid' ? it.download : '' }))
        }));
      return ok({ orders });
    }

    if (p === 'tickets') {
      const { user, err } = await requireUser();
      if (err) return err;
      const db = await load();
      const all = query.get('all') && isStaff(user);
      const tickets = db.tickets
        .filter((t) => all || t.userId === user.id)
        .sort((a, b) => b.createdAt - a.createdAt)
        .map((t) => ({ ...t, download: undefined }));
      return ok({ tickets });
    }

    if (p === 'admin/users') {
      const { user, err } = await requireStaff();
      if (err) return err;
      const db = await load();
      const counts = {};
      for (const o of db.orders) if (o.status === 'paid') counts[o.userId] = (counts[o.userId] || 0) + o.total;
      return ok({
        users: db.users
          .map((u) => ({ ...pub(u), pass: undefined, spend: counts[u.id] || 0, lastLogin: u.lastLogin || 0 }))
          .sort((a, b) => b.createdAt - a.createdAt)
      });
    }

    if (p === 'admin/stats') {
      const { err } = await requireStaff();
      if (err) return err;
      const db = await load();
      const paid = db.orders.filter((o) => o.status === 'paid');
      return ok({
        stats: {
          users: db.users.length,
          products: db.products.length,
          orders: db.orders.length,
          paid: paid.length,
          revenue: paid.reduce((s, o) => s + o.total, 0),
          openTickets: db.tickets.filter((t) => t.status !== 'closed').length,
          pendingReviews: db.reviews.filter((r) => r.status === 'pending').length,
          banned: db.users.filter((u) => u.banned).length
        }
      });
    }

    return bad('Böyle bir endpoint yok.', 404);
  }

  // ---------- MUTATIONS ----------
  if (method !== 'POST' && method !== 'PUT' && method !== 'DELETE')
    return bad('Metot desteklenmiyor.', 405);

  // auth
  if (p === 'auth/register') {
    const username = String(body.username || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    if (!validUsername(username)) return bad('Kullanıcı adı 3-24 karakter, harf/rakam/_. olmalı.');
    if (!validEmail(email)) return bad('Geçerli bir e-posta gir.');
    if (weakPassword(password, username))
      return bad('Şifre en az 6 karakter, kullanıcı adını içermemeli, ardışık 3 karakter olmamalı.');
    const user = await mutate((db) => {
      if (db.users.some((u) => u.username.toLowerCase() === username.toLowerCase()))
        return { error: 'Bu kullanıcı adı alınmış.' };
      if (db.users.some((u) => u.email === email)) return { error: 'Bu e-posta kayıtlı.' };
      const nu = {
        id: uid('usr_'),
        username,
        email,
        pass: bcrypt.hashSync(password, 10),
        role: 'member',
        bio: '',
        banned: false,
        banReason: '',
        createdAt: Date.now(),
        lastLogin: Date.now()
      };
      db.users.push(nu);
      return { user: nu };
    });
    if (user.error) return bad(user.error);
    await createSession(user.user.id);
    return ok({ user: pub(user.user) });
  }

  if (p === 'auth/login') {
    const username = String(body.username || '').trim();
    const password = String(body.password || '');
    const db = await load();
    const u = db.users.find(
      (x) => x.username.toLowerCase() === username.toLowerCase() || x.email === username.toLowerCase()
    );
    if (!u || !(await verifyPassword(password, u.pass))) return bad('Kullanıcı adı veya şifre hatalı.');
    if (u.banned) return json({ error: `Hesabın banlı: ${u.banReason || 'sebep belirtilmemiş'}` }, { status: 403 });
    await mutate((s) => {
      const t = s.users.find((x) => x.id === u.id);
      if (t) t.lastLogin = Date.now();
    });
    await createSession(u.id);
    return ok({ user: pub(u) });
  }

  if (p === 'auth/logout') {
    clearSession();
    return ok({ ok: true });
  }

  // account
  if (p === 'account/update') {
    const { user, err } = await requireUser();
    if (err) return err;
    const username = body.username != null ? String(body.username).trim() : user.username;
    const email = body.email != null ? String(body.email).trim().toLowerCase() : user.email;
    const bio = body.bio != null ? String(body.bio).slice(0, 400) : user.bio || '';
    if (!validUsername(username)) return bad('Geçersiz kullanıcı adı.');
    if (!validEmail(email)) return bad('Geçersiz e-posta.');
    const res = await mutate((db) => {
      if (db.users.some((u) => u.id !== user.id && u.username.toLowerCase() === username.toLowerCase()))
        return { error: 'Bu kullanıcı adı alınmış.' };
      if (db.users.some((u) => u.id !== user.id && u.email === email)) return { error: 'Bu e-posta kayıtlı.' };
      const t = db.users.find((u) => u.id === user.id);
      t.username = username;
      t.email = email;
      t.bio = bio;
      return { user: t };
    });
    if (res.error) return bad(res.error);
    return ok({ user: pub(res.user) });
  }

  if (p === 'account/password') {
    const { user, err } = await requireUser();
    if (err) return err;
    const current = String(body.current || '');
    const next = String(body.next || '');
    const db = await load();
    const u = db.users.find((x) => x.id === user.id);
    if (!(await verifyPassword(current, u.pass))) return bad('Mevcut şifre hatalı.');
    if (weakPassword(next, u.username)) return bad('Yeni şifre kural dışı.');
    await mutate((s) => {
      const t = s.users.find((x) => x.id === user.id);
      t.pass = bcrypt.hashSync(next, 10);
    });
    return ok({ ok: true });
  }

  // orders
  if (p === 'orders') {
    const { user, err } = await requireUser();
    if (err) return err;
    const items = Array.isArray(body.items) ? body.items : [];
    if (!items.length) return bad('Sepet boş.');
    const res = await mutate((db) => {
      const lines = [];
      for (const it of items) {
        const prod = db.products.find((x) => x.id === it.id && x.active);
        if (!prod) return { error: 'Ürün bulunamadı.' };
        const qty = Math.max(1, Math.min(99, Number(it.qty) || 1));
        if (prod.minRole && !roleAtLeast(user.role, prod.minRole))
          return { error: `${prod.name} için ${prod.minRole} rolü gerekli.` };
        lines.push({
          productId: prod.id,
          name: prod.name,
          price: prod.price,
          qty,
          download: prod.download || ''
        });
      }
      const total = lines.reduce((s, l) => s + l.price * l.qty, 0);
      const order = {
        id: uid('ord_'),
        userId: user.id,
        username: user.username,
        items: lines,
        total,
        status: total === 0 ? 'paid' : 'pending',
        note: String(body.note || '').slice(0, 500),
        createdAt: Date.now()
      };
      db.orders.push(order);
      return { order };
    });
    if (res.error) return bad(res.error);
    return ok({ order: res.order });
  }

  if (p === 'orders/status') {
    const { err } = await requireStaff();
    if (err) return err;
    const status = ['pending', 'paid', 'cancelled'].includes(body.status) ? body.status : null;
    if (!status) return bad('Geçersiz durum.');
    const res = await mutate((db) => {
      const o = db.orders.find((x) => x.id === body.id);
      if (!o) return { error: 'Sipariş yok.' };
      o.status = status;
      return { order: o };
    });
    if (res.error) return bad(res.error);
    return ok({ order: res.order });
  }

  // tickets
  if (p === 'tickets') {
    const { user, err } = await requireUser();
    if (err) return err;
    const dept = String(body.dept || 'Genel Destek').slice(0, 80);
    const priority = ['Normal', 'Yüksek', 'Acil'].includes(body.priority) ? body.priority : 'Normal';
    const message = String(body.message || '').trim();
    if (message.length < 10) return bad('Mesaj en az 10 karakter olmalı.');
    const ticket = await mutate((db) => {
      const t = {
        id: uid('tkt_'),
        userId: user.id,
        username: user.username,
        dept,
        priority,
        status: 'open',
        messages: [{ from: user.username, role: user.role, text: message, at: Date.now() }],
        createdAt: Date.now()
      };
      db.tickets.push(t);
      return t;
    });
    return ok({ ticket });
  }

  if (p === 'tickets/reply') {
    const { user, err } = await requireUser();
    if (err) return err;
    const text = String(body.text || '').trim();
    if (text.length < 2) return bad('Mesaj boş.');
    const res = await mutate((db) => {
      const t = db.tickets.find((x) => x.id === body.id);
      if (!t) return { error: 'Bilet yok.' };
      if (t.userId !== user.id && !isStaff(user)) return { error: 'Yetkin yok.' };
      t.messages.push({ from: user.username, role: user.role, text, at: Date.now() });
      if (isStaff(user)) t.status = 'answered';
      else if (t.status !== 'closed') t.status = 'open';
      return { ticket: t };
    });
    if (res.error) return bad(res.error);
    return ok({ ticket: res.ticket });
  }

  if (p === 'tickets/status') {
    const { err } = await requireStaff();
    if (err) return err;
    const status = ['open', 'answered', 'closed'].includes(body.status) ? body.status : null;
    if (!status) return bad('Geçersiz durum.');
    const res = await mutate((db) => {
      const t = db.tickets.find((x) => x.id === body.id);
      if (!t) return { error: 'Bilet yok.' };
      t.status = status;
      return { ticket: t };
    });
    if (res.error) return bad(res.error);
    return ok({ ticket: res.ticket });
  }

  // reviews
  if (p === 'reviews') {
    const { user, err } = await requireUser();
    if (err) return err;
    const text = String(body.text || '').trim();
    const rating = Math.max(1, Math.min(5, Number(body.rating) || 5));
    const category = String(body.category || 'genel').slice(0, 40);
    if (text.length < 10) return bad('Yorum en az 10 karakter olmalı.');
    const review = await mutate((db) => {
      const r = {
        id: uid('rev_'),
        user: user.username,
        userId: user.id,
        category,
        rating,
        text: text.slice(0, 1000),
        status: 'pending',
        createdAt: Date.now()
      };
      db.reviews.push(r);
      return r;
    });
    return ok({ review });
  }

  if (p === 'reviews/moderate') {
    const { err } = await requireStaff();
    if (err) return err;
    const status = ['approved', 'rejected', 'pending'].includes(body.status) ? body.status : null;
    if (!status) return bad('Geçersiz durum.');
    const res = await mutate((db) => {
      const r = db.reviews.find((x) => x.id === body.id);
      if (!r) return { error: 'Yorum yok.' };
      r.status = status;
      return { review: r };
    });
    if (res.error) return bad(res.error);
    return ok({ review: res.review });
  }

  // giveaways
  if (p === 'giveaways/join') {
    const { user, err } = await requireUser();
    if (err) return err;
    const res = await mutate((db) => {
      const g = (db.giveaways || []).find((x) => x.id === body.id);
      if (!g) return { error: 'Çekiliş bulunamadı.' };
      if (g.status !== 'active') return { error: 'Çekiliş kapalı.' };
      if (g.endsAt <= Date.now()) return { error: 'Süre doldu.' };
      if (!Array.isArray(g.entries)) g.entries = [];
      if (g.entries.includes(user.id)) return { error: 'Bu çekilişe zaten katıldın.' };
      g.entries.push(user.id);
      return { count: g.entries.length };
    });
    if (res.error) return bad(res.error);
    return ok({ entryCount: res.count });
  }

  // admin: giveaways
  if (p === 'admin/giveaways' || p === 'admin/giveaways/delete' || p === 'admin/giveaways/roll') {
    const { err } = await requireOwner();
    if (err) return err;

    if (p.endsWith('/delete')) {
      const res = await mutate((db) => {
        const i = (db.giveaways || []).findIndex((x) => x.id === body.id);
        if (i < 0) return { error: 'Çekiliş yok.' };
        db.giveaways.splice(i, 1);
        return { ok: true };
      });
      if (res.error) return bad(res.error);
      return ok(res);
    }

    if (p.endsWith('/roll')) {
      const res = await mutate((db) => {
        const g = (db.giveaways || []).find((x) => x.id === body.id);
        if (!g) return { error: 'Çekiliş yok.' };
        const pool = Array.isArray(g.entries) ? g.entries : [];
        g.winnerId = pool.length ? pool[Math.floor(Math.random() * pool.length)] : '';
        g.status = 'ended';
        const w = db.users.find((u) => u.id === g.winnerId);
        return { winner: w ? w.username : '' };
      });
      if (res.error) return bad(res.error);
      return ok({ winner: res.winner });
    }

    const data = {
      title: String(body.title || '').trim().slice(0, 160),
      prize: String(body.prize || '').trim().slice(0, 300),
      description: String(body.description || '').slice(0, 1000),
      endsAt: Math.max(Date.now() + 60000, Number(body.endsAt) || Date.now() + 86400000)
    };
    if (!data.title || !data.prize) return bad('Başlık ve ödül zorunlu.');
    const res = await mutate((db) => {
      if (!Array.isArray(db.giveaways)) db.giveaways = [];
      if (body.id) {
        const t = db.giveaways.find((x) => x.id === body.id);
        if (!t) return { error: 'Çekiliş yok.' };
        Object.assign(t, data);
        if (body.reopen) {
          t.status = 'active';
          t.winnerId = '';
        }
        return { giveaway: t };
      }
      const g = {
        id: uid('giv_'),
        status: 'active',
        entries: [],
        winnerId: '',
        createdAt: Date.now(),
        ...data
      };
      db.giveaways.push(g);
      return { giveaway: g };
    });
    if (res.error) return bad(res.error);
    return ok({ giveaway: res.giveaway });
  }

  // admin: products
  if (p === 'admin/products' || p === 'admin/products/delete') {
    const { err } = await requireStaff();
    if (err) return err;
    const deleting = p.endsWith('/delete');
    if (deleting) {
      const res = await mutate((db) => {
        const i = db.products.findIndex((x) => x.id === body.id);
        if (i < 0) return { error: 'Ürün yok.' };
        const [gone] = db.products.splice(i, 1);
        return { id: gone.id };
      });
      if (res.error) return bad(res.error);
      return ok(res);
    }
    const data = {
      name: String(body.name || '').trim().slice(0, 120),
      category: String(body.category || 'valorant').slice(0, 40),
      type: String(body.type || 'Yazılım').slice(0, 40),
      price: Math.max(0, Number(body.price) || 0),
      description: String(body.description || '').slice(0, 8000),
      guide: String(body.guide || '').slice(0, 4000),
      image: String(body.image || '').slice(0, 500),
      youtube: String(body.youtube || '').slice(0, 500),
      download: String(body.download || '').slice(0, 1000),
      virustotal: String(body.virustotal || '').slice(0, 500),
      stock: Math.max(0, Number(body.stock) || 0),
      minRole: ['booster', 'sponsor'].includes(body.minRole) ? body.minRole : null,
      featured: !!body.featured,
      active: body.active !== false,
      free: Number(body.price || 0) === 0
    };
    if (!data.name) return bad('Ürün adı zorunlu.');
    const res = await mutate((db) => {
      if (body.id) {
        const t = db.products.find((x) => x.id === body.id);
        if (!t) return { error: 'Ürün yok.' };
        Object.assign(t, data);
        return { product: t };
      }
      let slug = slugify(data.name);
      if (db.products.some((x) => x.slug === slug)) slug = `${slug}-${uid()}`;
      const prod = { id: uid('prd_'), slug, createdAt: Date.now(), ...data };
      db.products.push(prod);
      return { product: prod };
    });
    if (res.error) return bad(res.error);
    return ok({ product: res.product });
  }

  // admin: users (role / ban)
  if (p === 'admin/users') {
    const { user, err } = await requireOwner();
    if (err) return err;
    const ROLES = ['member', 'booster', 'sponsor', 'moderator', 'admin', 'founder', 'owner'];
    const res = await mutate((db) => {
      const t = db.users.find((x) => x.id === body.id);
      if (!t) return { error: 'Kullanıcı yok.' };
      if (body.role != null) {
        if (!ROLES.includes(body.role)) return { error: 'Geçersiz rol.' };
        // only owner can hand out founder/owner
        if (['founder', 'owner'].includes(body.role) && user.role !== 'owner') return { error: 'Sadece owner bunu yapabilir.' };
        if (['founder', 'owner'].includes(t.role) && user.role !== 'owner') return { error: 'Owner/founder değiştirilemez.' };
        if (t.id === user.id && body.role !== user.role) return { error: 'Kendi rolünü değiştiremezsin.' };
        t.role = body.role;
      }
      if (body.banned != null) {
        const target = t;
        if (['owner', 'founder'].includes(target.role) && user.role !== 'owner') return { error: 'Owner/founder banlanamaz.' };
        if (target.id === user.id) return { error: 'Kendini banlayamazsın.' };
        target.banned = !!body.banned;
        target.banReason = body.banned ? String(body.banReason || 'Sebep belirtilmedi').slice(0, 200) : '';
      }
      return { user: t };
    });
    if (res.error) return bad(res.error);
    return ok({ user: pub(res.user) });
  }

  // admin: announcements
  if (p === 'admin/announcements' || p === 'admin/announcements/delete') {
    const { user, err } = await requireOwner();
    if (err) return err;
    if (p.endsWith('/delete')) {
      const res = await mutate((db) => {
        const i = db.announcements.findIndex((x) => x.id === body.id);
        if (i < 0) return { error: 'Duyuru yok.' };
        db.announcements.splice(i, 1);
        return { ok: true };
      });
      if (res.error) return bad(res.error);
      return ok(res);
    }
    const data = {
      title: String(body.title || '').trim().slice(0, 160),
      body: String(body.body || '').trim().slice(0, 1000),
      active: body.active !== false
    };
    if (!data.title) return bad('Başlık zorunlu.');
    const res = await mutate((db) => {
      if (body.id) {
        const t = db.announcements.find((x) => x.id === body.id);
        if (!t) return { error: 'Duyuru yok.' };
        Object.assign(t, data);
        return { announcement: t };
      }
      const a = { id: uid('ann_'), createdAt: Date.now(), ...data };
      db.announcements.push(a);
      return { announcement: a };
    });
    if (res.error) return bad(res.error);
    return ok({ announcement: res.announcement });
  }

  // admin: maintenance
  if (p === 'admin/categories/sync') {
    const { err } = await requireOwner();
    if (err) return err;
    const res = await mutate((db) => {
      db.categories = CATEGORIES;
      return { categories: db.categories };
    });
    return ok(res);
  }

  if (p === 'admin/reset') {
    const { err } = await requireOwner();
    if (err) return err;
    const res = await mutate((db) => {
      const fresh = seedState();
      fresh.secret = db.secret || fresh.secret;
      Object.keys(db).forEach((k) => delete db[k]);
      Object.assign(db, fresh);
      return { ok: true };
    });
    if (res.error) return bad(res.error);
    return ok(res);
  }

  // admin: settings
  if (p === 'admin/settings') {
    const { err } = await requireOwner();
    if (err) return err;
    const res = await mutate((db) => {
      const s = db.settings;
      for (const k of ['siteName', 'tagline', 'heroTitle', 'heroSub', 'discord', 'email', 'currency']) {
        if (body[k] != null) s[k] = String(body[k]).slice(0, 300);
      }
      return { settings: s };
    });
    return ok({ settings: res.settings });
  }

  return bad('Böyle bir endpoint yok.', 404);
}

async function dispatch(req, ctx, method) {
  try {
    const url = new URL(req.url);
    const parts = (ctx?.params?.path || []).filter(Boolean);
    let body = {};
    if (method !== 'GET') body = await req.json().catch(() => ({}));
    return await handle(method, parts, url.searchParams, body);
  } catch (e) {
    console.error('[api]', e);
    return bad('Sunucu hatası: ' + e.message, 500);
  }
}

export const GET = (req, ctx) => dispatch(req, ctx, 'GET');
export const POST = (req, ctx) => dispatch(req, ctx, 'POST');
export const PUT = (req, ctx) => dispatch(req, ctx, 'PUT');
export const DELETE = (req, ctx) => dispatch(req, ctx, 'DELETE');
