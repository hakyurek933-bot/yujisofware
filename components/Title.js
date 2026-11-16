'use client';

import { useEffect } from 'react';

export default function Title({ children }) {
  useEffect(() => {
    document.title = children ? `${children} — Yujisofware` : 'Yujisofware — Ücretsiz Hile & Araçlar';
  }, [children]);
  return null;
}
