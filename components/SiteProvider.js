'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/client';

const SiteCtx = createContext(null);
export const useSite = () => useContext(SiteCtx);

const CART_KEY = 'yj_cart';

export default function SiteProvider({ children }) {
  const [boot, setBoot] = useState(null);
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState(null);

  const notify = useCallback((text, kind = 'ok') => {
    setToast({ text, kind, id: Date.now() });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    api('bootstrap')
      .then(setBoot)
      .catch(() => setBoot({ settings: {}, categories: [], announcements: [], products: [], reviews: [], stats: {} }));
    api('me')
      .then((d) => setUser(d.user))
      .catch(() => {});
    try {
      setCart(JSON.parse(localStorage.getItem(CART_KEY) || '[]'));
    } catch {}
  }, []);

  const saveCart = useCallback((next) => {
    setCart(next);
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const cartAdd = useCallback(
    (product, qty = 1) => {
      setCart((prev) => {
        const found = prev.find((i) => i.id === product.id);
        const next = found
          ? prev.map((i) => (i.id === product.id ? { ...i, qty: Math.min(99, i.qty + qty) } : i))
          : [...prev, { id: product.id, name: product.name, price: product.price, qty, category: product.category }];
        try {
          localStorage.setItem(CART_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
      notify(`${product.name} sepete eklendi.`);
    },
    [notify]
  );

  const cartSet = useCallback(
    (id, qty) => {
      setCart((prev) => {
        const next = prev
          .map((i) => (i.id === id ? { ...i, qty } : i))
          .filter((i) => i.qty > 0);
        try {
          localStorage.setItem(CART_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    []
  );

  const cartClear = useCallback(() => saveCart([]), [saveCart]);

  const login = useCallback(
    async (username, password) => {
      const d = await api('auth/login', { method: 'POST', body: { username, password } });
      setUser(d.user);
      return d.user;
    },
    []
  );

  const register = useCallback(async (username, email, password) => {
    const d = await api('auth/register', { method: 'POST', body: { username, email, password } });
    setUser(d.user);
    return d.user;
  }, []);

  const logout = useCallback(async () => {
    await api('auth/logout', { method: 'POST', body: {} });
    setUser(null);
  }, []);

  const reloadBoot = useCallback(() => {
    api('bootstrap').then(setBoot).catch(() => {});
  }, []);

  const value = {
    boot,
    user,
    setUser,
    cart,
    cartAdd,
    cartSet,
    cartClear,
    login,
    register,
    logout,
    notify,
    reloadBoot
  };

  return (
    <SiteCtx.Provider value={value}>
      {children}
      {toast && <div className={`toast ${toast.kind === 'err' ? 'err' : ''}`}>{toast.text}</div>}
    </SiteCtx.Provider>
  );
}
