'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Title from '@/components/Title';
import { api, dateTR } from '@/lib/client';
import { Stars, RoleBadge, Empty } from '@/lib/ui';

export default function ProfilePage() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    api(`profile/${encodeURIComponent(username)}`)
      .then((d) => setProfile(d.profile))
      .catch((e) => setErr(e.message));
  }, [username]);

  if (err) {
    return (
      <section className="sec wrap">
        <Title>Profil bulunamadı</Title>
        <Empty icon="👤" text={err} />
        <div style={{ textAlign: 'center' }}>
          <Link href="/yorumlar" className="btn btn-gold">
            Yorumlara dön
          </Link>
        </div>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="sec wrap">
        <div className="spinner" />
      </section>
    );
  }

  return (
    <section className="sec wrap">
      <Title>{profile.username}</Title>
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="avatar" style={{ width: 56, height: 56, fontSize: 22 }}>
            {profile.username[0].toUpperCase()}
          </span>
          <div>
            <h1 style={{ fontSize: 24 }}>{profile.username}</h1>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
              <RoleBadge role={profile.role} />
              <span className="mut" style={{ fontSize: 13 }}>
                Katılma: {dateTR(profile.createdAt)}
              </span>
            </div>
          </div>
        </div>
        {profile.bio && (
          <p className="mut" style={{ marginTop: 14 }}>
            {profile.bio}
          </p>
        )}
      </div>

      <div className="sec-head">
        <div>
          <span className="kicker">Yorumlar</span>
          <h2 className="sec-title" style={{ fontSize: 24 }}>
            {profile.reviews.length} düşünce
          </h2>
        </div>
        <Link href="/yorumlar" className="btn btn-sm">
          Tüm yorumlar
        </Link>
      </div>

      {profile.reviews.length === 0 ? (
        <Empty icon="💭" text="Bu kullanıcının onaylı yorumu yok." />
      ) : (
        <div className="rev-grid">
          {profile.reviews.map((r) => (
            <div className="rev" key={r.id}>
              <Stars n={r.rating} />
              <p>{r.text}</p>
              <div className="rev-who">
                <span className="rev-cat">{r.category}</span>
                <span className="mut" style={{ marginLeft: 'auto', fontSize: 12 }}>
                  {dateTR(r.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
