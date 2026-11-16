# yujisofware

ggklani.win tarzı premium game tools mağazası — Next.js 14 (App Router), Vercel'e hazır.

## Özellikler

- **Mağaza**: kategori filtresi, arama, ürün detay sayfası, sepet, sipariş
- **Roller**: `owner`, `founder`, `admin`, `moderator`, `sponsor`, `booster`, `member`
- **Ban sistemi**: banlanan hesap giriş yapamaz, aktif oturumu düşer
- **Yetkili paneli** (`/admin`): ürün CRUD, sipariş onaylama, rol/ban yönetimi, yorum moderasyonu, biletler, duyurular, site ayarları
- **Destek ticket** sistemi, yorum duvarı (moderasyonlu), duyuru bandı, bildirim zili
- **Auth**: bcrypt şifre + HMAC-SHA256 imzalı HttpOnly cookie oturumu

## Kurulum

```bash
npm install
npm run dev
```

http://localhost:3000 — ilk açılışta `data/db.json` otomatik seed edilir.

### İlk giriş (seed)

| Alan | Değer |
|---|---|
| Kullanıcı | `owner` |
| Şifre | `owner123!` |

Girişten sonra **Hesabım → Güvenlik** bölümünden şifreyi değiştir.

## Vercel'e deploy

1. Bu repo'yu GitHub'a ititle, Vercel'de **Import** et (framework otomatik algılanır).
2. Vercel dashboard → **Storage** → **Blob** → yeni store oluştur → `BLOB_READ_WRITE_TOKEN` env'e otomatik yazılır.
3. Deploy'u tetikle. Veriler artık Blob'da tutulur (dosya sistemi Vercel'de salt okunur olduğu için local dosya driver'ı sadece `npm run dev` içindir).

Env değişkenleri:

| Değişken | Zorunlu | Açıklama |
|---|---|---|
| `BLOB_READ_WRITE_TOKEN` | Vercel'de evet | Veri katmanı (Vercel Blob storage) |
| `SESSION_SECRET` | hayır | Boşsa oturum anahtarı ilk kayıtta üretilip depolanır |

## Roller & yetkiler

| Rol | Panel | Rol atama | Ban | Duyuru / Ayar |
|---|---|---|---|---|
| owner | ✅ | ✅ (herkes) | ✅ | ✅ |
| founder | ✅ | ✅ (owner hariç) | ✅ | ✅ |
| admin | ✅ | ❌ | ✅ | ❌ |
| moderator | ✅ | ❌ | ❌ | ❌ |
| sponsor / booster / member | ❌ | ❌ | ❌ | ❌ |

Ürünlere `minRole` (booster/sponsor) verilebilir — o ürünler yalnızca yeterli role sahip üyelere satılır.

## Notlar

- Tüm veri tek JSON şemasında (`lib/seed.js` yapısı): `users`, `products`, `orders`, `tickets`, `reviews`, `announcements`, `settings`.
- Ödemeli siparişler `pending` başlar; panelde **Onayla** deyince üye indirme bağlantısını görür. Ücretsiz ürünler anında teslim edilir.
