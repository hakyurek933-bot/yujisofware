import bcrypt from 'bcryptjs';

export const CATEGORIES = [
  { id: 'valorant', name: 'VALORANT', tag: 'FPS', desc: 'Skin, Hesap & Araçlar', grad: 'linear-gradient(135deg,#ff4655,#7a1220)' },
  { id: 'cs2', name: 'COUNTER STRIKE 2', tag: 'SHOOTER', desc: 'Skin, Hesap & Bypass', grad: 'linear-gradient(135deg,#f5a623,#5b3a00)' },
  { id: 'lol', name: 'LEAGUE OF LEGENDS', tag: 'MOBA', desc: 'Hesap & Premium Araçlar', grad: 'linear-gradient(135deg,#c8a44d,#1e3a8a)' },
  { id: 'ai', name: 'YAPAY ZEKA', tag: 'AI / BOT', desc: 'AI Tooling & Botlar', grad: 'linear-gradient(135deg,#7c5cff,#00e0c6)' },
  { id: 'underground', name: 'UNDERGROUND', tag: 'METOT', desc: 'Özel Scriptler & Metotlar', grad: 'linear-gradient(135deg,#2b2b3a,#000)' },
  { id: 'booster', name: 'BOOSTER ÖZEL', tag: 'VIP BOOSTER', desc: 'VIP İndirimli & Özel Ürünler', grad: 'linear-gradient(135deg,#ff8ae0,#7c5cff)' }
];

export function seedState() {
  const now = Date.now();
  const ownerPass = bcrypt.hashSync('owner123!', 10);

  return {
    secret: '',
    settings: {
      siteName: 'Yujisofware',
      tagline: 'ONLY SKILL. ONLY POWER. ONLY US.',
      heroTitle: 'YUJISOFTWARE',
      heroSub: 'Premium game tools — undetected, anında teslimat, 7/24 destek.',
      discord: 'https://discord.gg/yujisofware',
      email: 'destek@yujisofware.win',
      currency: '₺'
    },
    categories: CATEGORIES,
    users: [
      {
        id: 'usr_owner01',
        username: 'owner',
        email: 'owner@yujisofware.win',
        pass: ownerPass,
        role: 'owner',
        bio: 'Kurucu',
        banned: false,
        banReason: '',
        createdAt: now,
        lastLogin: 0
      }
    ],
    products: [
      {
        id: 'prd_radiant',
        slug: 'radiant-soft-aim',
        name: 'Radiant Soft Aim',
        category: 'valorant',
        type: 'Yazılım',
        price: 2499,
        free: false,
        featured: true,
        active: true,
        minRole: null,
        image: '',
        youtube: '',
        download: '',
        virustotal: '',
        stock: 999,
        createdAt: now,
        description:
          'Radiant Soft Aim, düşük gecikmeli nişan yardımcısıdır. FOV ve smoothing değerleri panelden anında ayarlanır, profil sistemiyle kayıtlı konfigürasyonlar arası geçiş saniyeler içinde yapılır.\n\nKurulum: dosyayı çıkar, oyunu başlat, aracı yönetici olarak çalıştır. Panel açıldığında hesabınıza bağlı lisans otomatik doğrulanır.',
        guide: '1. Dosyayı çıkar\n2. Valorant\'ı başlat\n3. Yujisofware.exe → Yönetici olarak çalıştır\n4. Panelden profil seç → Aktif Et'
      },
      {
        id: 'prd_cs2esp',
        slug: 'cs2-external-esp',
        name: 'CS2 External ESP Pack',
        category: 'cs2',
        type: 'Yazılım',
        price: 3499,
        free: false,
        featured: true,
        active: true,
        minRole: null,
        image: '',
        youtube: '',
        download: '',
        virustotal: '',
        stock: 500,
        createdAt: now,
        description:
          'Read-only external ESP: view matrix üzerinden çalışır, hiçbir yere yazma işlemi yapmaz. Skeleton, box, isim, can, silah ve bomba bilgisi overlay üzerinde gösterilir.\n\nOverlay ayrı pencere olarak açılır, oyunu kapatmadan ayar değiştirebilirsiniz.',
        guide: '1. Oyunu başlat\n2. Yujisofware ESP.exe → Çalıştır\n3. Insert ile menü, F2 ile preset değiştir'
      },
      {
        id: 'prd_lolbundle',
        slug: 'lol-smurf-bundle',
        name: 'LoL Smurf Hesap Paketi',
        category: 'lol',
        type: 'Hesap',
        price: 599,
        free: false,
        featured: false,
        active: true,
        minRole: null,
        image: '',
        youtube: '',
        download: '',
        virustotal: '',
        stock: 120,
        createdAt: now,
        description:
          'Seviye 30+ smurf hesaplar, e-posta bilgileriyle birlikte teslim edilir. Her hesap tek kişiye gider, değişiklik talebi alınmaz.\n\nTeslimat Discord ticket üzerinden yapılır.',
        guide: '1. Siparişi ver\n2. Discord\'da ticket aç\n3. Hesap bilgilerini ticket üzerinden al'
      },
      {
        id: 'prd_aifarm',
        slug: 'ai-oto-farm-botu',
        name: 'AI Oto-Farm Botu',
        category: 'ai',
        type: 'Bot',
        price: 1999,
        free: false,
        featured: true,
        active: true,
        minRole: null,
        image: '',
        youtube: '',
        download: '',
        virustotal: '',
        stock: 300,
        createdAt: now,
        description:
          'Görüntü tabanlı model ile harita okur, rotayı kendisi çizer. Makro kaydı yapmaz — ekranda ne görürse ona göre karar verir.\n\nAyar panelinden karakter, bölge ve oturum süresi seçilir.',
        guide: '1. Botu başlat\n2. Bölge ve karakter seç\n3. Start → log panelinden takip et'
      },
      {
        id: 'prd_underkit',
        slug: 'underground-method-kit',
        name: 'Underground Method Kit',
        category: 'underground',
        type: 'Paket',
        price: 4999,
        free: false,
        featured: false,
        active: true,
        minRole: null,
        image: '',
        youtube: '',
        download: '',
        virustotal: '',
        stock: 50,
        createdAt: now,
        description:
          'Metot, script ve rehber arşivi. Her güncelleme lisanslı üyelere otomatik düşer, arşiv sürekli büyür.\n\nİçerik: metot dosyaları, örnek uygulamalar, adım adım kullanım kılavuzu.',
        guide: '1. Lisansını doğrula\n2. Arşiv bağlantısını al\n3. Klasörü aç, kılavuzu oku'
      },
      {
        id: 'prd_boosterlife',
        slug: 'booster-lifetime-license',
        name: 'Booster Lifetime License',
        category: 'booster',
        type: 'Lisans',
        price: 999,
        free: false,
        featured: false,
        active: true,
        minRole: 'booster',
        image: '',
        youtube: '',
        download: '',
        virustotal: '',
        stock: 200,
        createdAt: now,
        description:
          'Sunucuya boost basan üyelere özel ömür boyu lisans. Tüm ürünlerde geçerli indirim + beta erken erişim.\n\nSadece Booster rolü taşıyan üyeler satın alabilir.',
        guide: '1. Sunucuya boost bas\n2. Booster rolünü al\n3. Satın al → lisansın anında aktif'
      },
      {
        id: 'prd_spooferlite',
        slug: 'spoofer-lite-ucretsiz',
        name: 'Spoofer Lite (Ücretsiz)',
        category: 'valorant',
        type: 'Yazılım',
        price: 0,
        free: true,
        featured: false,
        active: true,
        minRole: null,
        image: '',
        youtube: '',
        download: '',
        virustotal: '',
        stock: 9999,
        createdAt: now,
        description:
          'Temel MAC ve HWID yenileme aracı. Oturum başında bir kez çalışır, kayıt defteri temizliği yapar.\n\nGiriş yapan tüm üyeler için ücretsiz.',
        guide: '1. Aracı çalıştır\n2. Yenile butonuna bas\n3. Oyunu başlat'
      }
    ],
    orders: [],
    tickets: [],
    reviews: [
      {
        id: 'rev_seed1',
        user: 'kaan_p',
        category: 'valorant',
        rating: 5,
        text: 'Teslimat 2 dakikada geldi, panel gerçekten temiz. Fiyatı hakediyor.',
        status: 'approved',
        createdAt: now - 86400000 * 2
      },
      {
        id: 'rev_seed2',
        user: 'mert.exe',
        category: 'cs2',
        rating: 5,
        text: 'ESP pack haftadır sorunsuz, ticket desteği de hızlı. W site.',
        status: 'approved',
        createdAt: now - 86400000 * 5
      },
      {
        id: 'rev_seed3',
        user: 'zeynep',
        category: 'ai',
        rating: 4,
        text: 'Bot beklediğimden iyi çalışıyor, kurulum 5 dakika sürdü. Eklenmesi gereken birkaç ayar var ama genel memnunum.',
        status: 'approved',
        createdAt: now - 86400000 * 9
      }
    ],
    announcements: [
      {
        id: 'ann_seed1',
        title: 'Yeni mağaza açıldı',
        body: 'Yujisofware tüm ürünleriyle yayında. Boostlayan üyelere özel ürünler mağazada.',
        active: true,
        createdAt: now
      }
    ]
  };
}
