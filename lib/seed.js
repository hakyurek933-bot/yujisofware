import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

export const CATEGORIES = [
  { id: 'valorant', name: 'VALORANT', tag: 'FPS', desc: 'Skin, Hesap & Ücretsiz Araçlar', grad: 'linear-gradient(135deg,#ff4655,#7a1220)' },
  { id: 'cs2', name: 'COUNTER STRIKE 2', tag: 'SHOOTER', desc: 'Skin, Hesap & Bypass', grad: 'linear-gradient(135deg,#f5a623,#5b3a00)' },
  { id: 'lol', name: 'LEAGUE OF LEGENDS', tag: 'MOBA', desc: 'Hesap & Premium Araçlar', grad: 'linear-gradient(135deg,#c8a44d,#1e3a8a)' },
  { id: 'minecraft', name: 'MİNECRAFT', tag: 'SANDBOX', desc: 'Hile, Client & Araçlar', grad: 'linear-gradient(135deg,#3ddc84,#14532d)' },
  { id: 'roblox', name: 'ROBLOX', tag: 'SANDBOX', desc: 'Script & Executor Araçları', grad: 'linear-gradient(135deg,#e11d48,#4c0519)' },
  { id: 'fortnite', name: 'FORTNITE', tag: 'BATTLE ROYALE', desc: 'Skin, Hesap & Araçlar', grad: 'linear-gradient(135deg,#7c5cff,#2b1a66)' },
  { id: 'underground', name: 'UNDERGROUND', tag: 'METOT', desc: 'Özel Scriptler & Metotlar', grad: 'linear-gradient(135deg,#2b2b3a,#000)' },
  { id: 'booster', name: 'BOOSTER ÖZEL', tag: 'VIP BOOSTER', desc: 'VIP Erişimli Araçlar', grad: 'linear-gradient(135deg,#ff8ae0,#7c5cff)' }
];

export function seedState() {
  const now = Date.now();

  return {
    secret: '',
    settings: {
      siteName: 'Yujisofware',
      tagline: 'FREE HILE. FREE TOOLS. NO PAYWALL.',
      heroTitle: 'YUJISOFTWARE',
      heroSub: 'Tüm hile ve araçlar tamamen ücretsiz. Üye ol, indir, oyna — fiyat etiketi yok.',
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
        pass: bcrypt.hashSync('owner123!', 10),
        role: 'owner',
        bio: 'Kurucu',
        banned: false,
        banReason: '',
        createdAt: now,
        lastLogin: 0
      },
      {
        id: 'usr_admin01',
        username: 'admin',
        email: 'admin@yujisofware.win',
        pass: bcrypt.hashSync('admin123!', 10),
        role: 'admin',
        bio: 'Yetkili',
        banned: false,
        banReason: '',
        createdAt: now,
        lastLogin: 0
      },
      {
        id: 'usr_kaanp',
        username: 'kaan_p',
        email: 'kaan_p@users.noreply.github.com',
        pass: bcrypt.hashSync(crypto.randomBytes(24).toString('hex'), 10),
        role: 'member',
        bio: '',
        banned: false,
        banReason: '',
        createdAt: now - 86400000 * 30,
        lastLogin: 0
      },
      {
        id: 'usr_mert',
        username: 'mert.exe',
        email: 'mert@users.noreply.github.com',
        pass: bcrypt.hashSync(crypto.randomBytes(24).toString('hex'), 10),
        role: 'member',
        bio: '',
        banned: false,
        banReason: '',
        createdAt: now - 86400000 * 22,
        lastLogin: 0
      },
      {
        id: 'usr_zeynep',
        username: 'zeynep',
        email: 'zeynep@users.noreply.github.com',
        pass: bcrypt.hashSync(crypto.randomBytes(24).toString('hex'), 10),
        role: 'member',
        bio: '',
        banned: false,
        banReason: '',
        createdAt: now - 86400000 * 14,
        lastLogin: 0
      }
    ],
    products: [],
    orders: [],
    tickets: [],
    giveaways: [
      {
        id: 'gwl_seed1',
        title: 'Başlangıç Çekilişi',
        prize: 'Ücretsiz Araç Paketi + Ömür Boyu Üyelik',
        description: 'Çekilişe katılanlar arasından kura ile bir kişi seçilecek. Ödül anında teslim ediliyor.',
        endsAt: now + 1000 * 60 * 60 * 24 * 7,
        status: 'active',
        winnerId: '',
        entries: [],
        createdAt: now
      }
    ],
    reviews: [
      {
        id: 'rev_seed1',
        user: 'kaan_p',
        category: 'valorant',
        rating: 5,
        text: 'Hile bedava, indirme linki anında açılıyor. Beklediğimden iyi.',
        status: 'approved',
        createdAt: now - 86400000 * 2
      },
      {
        id: 'rev_seed2',
        user: 'mert.exe',
        category: 'cs2',
        rating: 5,
        text: 'Araçlar düzgün çalışıyor, ticket desteği de hızlı. W site.',
        status: 'approved',
        createdAt: now - 86400000 * 5
      },
      {
        id: 'rev_seed3',
        user: 'zeynep',
        category: 'minecraft',
        rating: 5,
        text: 'Minecraft hilesi sorunsuz, kurulum 2 dakika sürdü.',
        status: 'approved',
        createdAt: now - 86400000 * 9
      }
    ],
    announcements: [
      {
        id: 'ann_seed1',
        title: 'Tüm araçlar artık ücretsiz',
        body: 'Paywall yok, fiyat etiketi yok. Üye ol, indir, oyna.',
        active: true,
        createdAt: now
      }
    ]
  };
}
