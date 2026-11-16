import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="sec wrap" style={{ textAlign: 'center', padding: '90px 20px' }}>
      <div style={{ fontSize: 78, fontWeight: 900, lineHeight: 1 }} className="gold">
        404
      </div>
      <h1 className="sec-title" style={{ marginTop: 10 }}>
        Bu sayfa kayıp
      </h1>
      <p className="sec-sub" style={{ margin: '12px auto 26px' }}>
        Aradığın sayfa taşınmış ya da hiç var olmamış. Araçlar hâlâ burada.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/" className="btn btn-gold">
          Ana sayfa
        </Link>
        <Link href="/magaza" className="btn">
          Ücretsiz araçlar
        </Link>
        <Link href="/cekilis" className="btn btn-violet">
          🎉 Çekilişler
        </Link>
      </div>
    </section>
  );
}
