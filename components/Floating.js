'use client';

import { useEffect, useState } from 'react';
import { useSite } from './SiteProvider';

export default function Floating() {
  const { boot } = useSite();
  const [show, setShow] = useState(false);
  const discord = boot?.settings?.discord || 'https://discord.gg/yujisofware';

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="floating">
      {show && (
        <button className="fab top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} title="Yukarı">
          ↑
        </button>
      )}
      <a className="fab discord" href={discord} target="_blank" rel="noreferrer" title="Discord">
        💬
      </a>
    </div>
  );
}
