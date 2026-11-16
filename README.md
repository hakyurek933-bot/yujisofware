# yujisofware

Ücretsiz hile & araç dağıtım sitesi — Next.js 14 (App Router), Vercel'e hazır. ggklani.win düzeni, paywall yok.

## Model

- **Her şey ücretsiz**: ürün satılmıyor, fiyat etiketi yok. Üye ol → indir.
- **Ürünleri sen ekliyorsun**: panelden eklenir, seed boş gelir.
- **Çekiliş alanı**: `/cekilis` — üyeler katılır, panelden kura çekilir, kazanan duyurulur.
- **Üye sayacı**: ana sayfada "N kişi kayı oldu" bandı, hero istatistikleri.

## Kategoriler

`VALORANT` · `CS2` · `LOL` · `MİNECRAFT` · `ROBLOX` · `FORTNITE` · `UNDERGROUND` · `BOOSTER ÖZEL`

AI kategorisi kaldırıldı. Yeni kategori eklemek için `lib/seed.js` → `CATEGORIES`, sonra panelden **Kategorileri Güncelle**.

## Roller

`owner` > `founder` > `admin` > `moderator` > `sponsor` > `booster` > `member`

| Rol | Panel | Rol atama | Ban | Çekiliş / Duyuru / Ayar |
|---|---|---|---|---|
| owner | ✅ | ✅ | ✅ | ✅ |
| founder | ✅ | ✅ | ✅ | ✅ |
| admin | ✅ | ❌ | ✅ | ❌ |
| moderator | ✅ | ❌ | ❌ | ❌ |
| sponsor / booster / member | ❌ | ❌ | ❌ | ❌ |

Ürünlere `minRole` (booster/sponsor) verilebilir — o araçlar sadece yeterli role sahip üyelere açılır.

## Hesaplar (seed)

| Rol | Kullanıcı | Şifre |
|---|---|---|
| owner | `owner` | `owner123!` |
| admin | `admin` | `admin123!` |

İlk girişten sonra **Hesabım → Güvenlik** bölümünden şifreleri değiştir.

## Kurulum

```bash
npm install
npm run dev
```

http://localhost:3000 — ilk açılışta `data/db.json` seed ile oluşur (local dosya driver'ı).

## Vercel'e deploy

1. Repo'yu GitHub'a it, Vercel'de **Import** et (Next.js preset otomatik).
2. **Storage → Create Store → Blob** oluştur → `BLOB_READ_WRITE_TOKEN` env'e otomatik yazılır.
3. **Deployments → son deploy → Redeploy**.

Vercel'de dosya sistemi salt-okunur; veri katmanı Blob'a gider. Blob store boşsa site seed ile açılır.

## Panel (`/admin`)

- **Ürünler**: ekle / düzenle / sil — fiyat `0` = ücretsiz, indirme linki, YouTube, VirusTotal, `minRole` kilidi, **indirme sayacı**
- **Siparişler**: ücretsiz ürünler otomatik teslim edilir; ücretli olanlar **Onayla** ile açılır
- **Kullanıcılar & Roller**: rol atama, banlama (banlı hesap giriş yapamaz)
- **Çekiliş**: oluştur, **Kura Çek**, yeniden aç, sil
- **Yorumlar**: onayla / reddet
- **Biletler**: durum yönetimi
- **Duyurular**: site üst bandı
- **Ayarlar**: site adı, slogan, hero, Discord, e-posta + **Bakım**: Kategorileri Güncelle / Fabrika Ayarlarına Dön

Panel giriş zorunlu değil: `/admin` açılınca **sayfa içinde** giriş formu çıkar, yetkin yoksa ne yapılacağını söyler.

## Sayfalar

`/` · `/magaza` · `/urun/[slug]` · `/cekilis` · `/destek` · `/yorumlar` · `/u/[username]` · `/hesap` · `/sepet` · `/booster` · `/iletisim` · `/giris` · `/kayit` · `/admin`

Profil sayfaları kullanıcının rolünü, katılma tarihini ve onaylı yorumlarını gösterir.

## Veri şeması

`users` · `products` · `orders` · `tickets` · `reviews` · `announcements` · `giveaways` · `categories` · `settings` — hepsi `lib/seed.js` yapısında, tek JSON blob olarak Blob'da durur.
