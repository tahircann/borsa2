# Üyelik Sistemi Dokümantasyonu

## Genel Bakış

Bu uygulama için kapsamlı bir üyelik sistemi oluşturulmuştur. Sistem ücretsiz ve premium üyelik seçenekleri sunar.

## Özellikler

### 🔐 Kimlik Doğrulama
- **Kullanıcı Kaydı**: Email ve şifre ile hesap oluşturma
- **Giriş Yapma**: Email/şifre ile giriş
- **Şifre Güvenliği**: Basit hash algoritması (production ortamında bcrypt kullanılmalı)
- **Admin Hesabı**: `admin@borsa.com` / `123456`

### 💳 Üyelik Türleri
- **Ücretsiz Üyelik**: Temel özellikler
- **Premium Üyelik**: Tüm özellikler + gelişmiş analiz araçları

### 💰 Fiyatlandırma
- **Aylık Premium**: $25/ay
- **Yıllık Premium**: $240/yıl (%20 tasarruf)

### 🔒 Korumalı Özellikler
Premium üyelik gerektiren sayfalar:
- **Stock Ranks** (`/stock-ranks`)
- **Portfolio** (`/portfolio`)

## Teknik Detaylar

### Bileşenler

#### Authentication (`utils/auth.ts`)
- Kullanıcı kaydı ve giriş işlemleri
- LocalStorage tabanlı oturum yönetimi
- Şifre hash'leme ve doğrulama
- Premium üyelik kontrolü

#### Subscription (`utils/subscription.ts`)
- Üyelik planları yönetimi
- Ödeme işlemi simülasyonu
- Üyelik durumu kontrolü
- Otomatik yenileme sistemi

#### PremiumGuard (`components/PremiumGuard.tsx`)
- Premium sayfa koruma bileşeni
- Otomatik yönlendirme
- Kullanıcı dostu uyarı mesajları

#### Membership Checker (`utils/membershipChecker.ts`)
- Otomatik üyelik süre kontrolü
- Süresi dolan üyelikleri ücretsiz hesaba çevirme
- İstatistik ve raporlama

### Modals
- **LoginModal**: Giriş yapma formu
- **RegisterModal**: Kayıt olma formu
- **SubscriptionModal**: Premium üyelik satın alma

### Güvenlik

#### Mevcut Güvenlik Önlemleri
- Basit şifre hash'leme
- Email format doğrulaması
- Client-side veri validasyonu
- LocalStorage tabanlı oturum yönetimi

#### Production İçin Öneriler
```typescript
// bcrypt kullanımı
import bcrypt from 'bcryptjs';

const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 12);
};

// JWT token kullanımı
import jwt from 'jsonwebtoken';

const generateToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: '7d'
  });
};
```

## Kullanım Kılavuzu

### 1. Hesap Oluşturma
1. Ana sayfada "Kayıt Ol" butonuna tıklayın
2. Email, kullanıcı adı ve şifre girin
3. "Hesap Oluştur" butonuna tıklayın
4. Başarılı mesajından sonra giriş yapın

### 2. Premium Üyelik Satın Alma
1. Giriş yaptıktan sonra "Premium Ol" butonuna tıklayın
2. Aylık ($25) veya Yıllık ($240) plan seçin
3. Kredi kartı bilgilerini girin (demo amaçlı)
4. "Ödemeyi Tamamla" butonuna tıklayın

### 3. Premium Özelliklere Erişim
- Stock Ranks ve Portfolio sayfalarına artık erişebilirsiniz
- Navbar'da premium durumunuz görünür
- Üyelik süresi takip edilir

## API Endpoints

### Kimlik Doğrulama
```
GET /api/auth/status - Oturum durumu kontrolü
```

## Veritabanı Yapısı (LocalStorage)

### Users
```typescript
interface User {
  id: string;
  email: string;
  username: string;
  isAdmin: boolean;
  membershipType: 'free' | 'premium';
  membershipExpiry?: Date;
  createdAt: Date;
}
```

### Passwords
```
localStorage key: `password_${userId}`
value: hashed password
```

## Yapılandırma

### Üyelik Süreleri
- Aylık: 30 gün
- Yıllık: 365 gün

### Otomatik Kontroller
- Her saat başı süre kontrolü
- Süresi dolan üyelikler otomatik olarak ücretsiz hesaba çevrilir

## Maintenance

### Üyelik İstatistikleri
```typescript
import { getMembershipStats } from '../utils/membershipChecker';

const stats = getMembershipStats();
console.log('Toplam kullanıcı:', stats.total);
console.log('Premium üye:', stats.premium);
console.log('7 gün içinde süres dolan:', stats.expiringIn7Days);
```

### Manuel Yenileme
```typescript
import { renewMembership } from '../utils/membershipChecker';

const success = renewMembership('userId123', 'yearly');
```

## Test Hesapları

### Admin Hesabı
- Email: `admin@borsa.com`
- Şifre: `123456`
- Tüm premium özellikler aktif

### Demo Premium Hesabı Oluşturma
1. Normal hesap oluşturun
2. Premium satın alın
3. Browser developer tools ile `localStorage` kontrol edin

## Troubleshooting

### Yaygın Sorunlar

1. **Premium özellikler görünmüyor**
   - Giriş yapıp yapmadığınızı kontrol edin
   - Premium üyeliğinizin süresi dolmuş olabilir
   - Sayfa yenilemeyi deneyin

2. **Ödeme işlemi başarısız**
   - Demo ortamında %90 başarı oranı vardır
   - Birkaç kez deneyin

3. **Oturum kapanıyor**
   - LocalStorage temizlenmiş olabilir
   - Tekrar giriş yapın

## Geliştirme Notları

### Gelecek Güncellemeler
- [ ] Gerçek ödeme entegrasyonu (Stripe/PayPal)
- [ ] Email doğrulama sistemi
- [ ] Şifre sıfırlama
- [ ] Sosyal medya girişi
- [ ] Database entegrasyonu (PostgreSQL/MongoDB)
- [ ] Server-side rendering ile güvenlik artırımı
- [ ] Rate limiting
- [ ] Audit logging

### Performance Optimizasyonları
- [ ] Memoization için React.memo kullanımı
- [ ] Lazy loading
- [ ] Service worker ile offline support
- [ ] CDN entegrasyonu

## Katkıda Bulunma

1. Feature branch oluşturun
2. Değişikliklerinizi test edin
3. PR gönderin
4. Code review bekleyin

---

**Not**: Bu sistem demo amaçlıdır. Production ortamında ek güvenlik önlemleri alınmalıdır. 