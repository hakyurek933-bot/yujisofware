export default function Loading() {
  return (
    <div className="wrap sec" style={{ textAlign: 'center', padding: '90px 20px' }}>
      <div className="spinner" />
      <div className="mut" style={{ marginTop: 14, fontSize: 14 }}>
        Yükleniyor...
      </div>
    </div>
  );
}
