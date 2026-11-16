'use client';

export default function Error({ error, reset }) {
  return (
    <section className="sec wrap" style={{ textAlign: 'center', padding: '90px 20px' }}>
      <div style={{ fontSize: 60 }}>💥</div>
      <h1 className="sec-title" style={{ fontSize: 26 }}>
        Bir şeyler ters gitti
      </h1>
      <p className="sec-sub" style={{ margin: '12px auto 26px' }}>
        {error?.message || 'Beklenmeyen bir hata oluştu.'}
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn btn-gold" onClick={() => reset()}>
          ↻ Tekrar dene
        </button>
        <a href="/" className="btn">
          Ana sayfa
        </a>
      </div>
    </section>
  );
}
