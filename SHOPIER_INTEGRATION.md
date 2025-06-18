# Shopier Entegrasyonu Kurulum Rehberi

Bu proje Shopier ödeme sistemi ile entegre edilmiştir. Aşağıdaki adımları takip ederek entegrasyonu aktifleştirebilirsiniz.

## 1. Shopier Hesabı ve API Anahtarları

### Shopier Hesabı Oluşturma
1. [Shopier.com](https://www.shopier.com) adresine gidin
2. "Ücretsiz Üye Ol" butonuna tıklayın
3. Hesabınızı oluşturun ve doğrulayın

### API Anahtarlarını Alma
1. Shopier hesabınıza giriş yapın
2. **Hesap Yönetimi > Kişisel Erişim Anahtarı** bölümüne gidin
3. İki adımlı doğrulamayı etkinleştirin (gerekli)
4. Kişisel erişim anahtarınızı oluşturun
5. API anahtarınızı ve secret'ınızı güvenli bir yerde saklayın

## 2. Environment Değişkenlerini Ayarlama

Projenizin kök dizininde `.env.local` dosyası oluşturun:

```bash
# Shopier Personal Access Token (JWT Token)
SHOPIER_PERSONAL_ACCESS_TOKEN=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJkOWFlNjg2ZTUzZmRlNTA0MzdhMzQxOWExYjZkN2YxMiIsImp0aSI6IjFhZDZhMTRkYWRiM2M1MThmY2UwZWJiZDI1MTUwM2NlODljMDU0MzY2MWNiYWFhYjA0NGIxNjcyNmZmODM2Zjk1YzVmZDczMTdhMDAzMDZkNzAxMWIyODNlNGM4NmU5Mjk5ZjY3NWQ2NTJmYzkwNjYzY2I2OTkwYWI3NGYxZTg0NmFkYjc4M2JmOGYzMDliZTFlNzc4MjdjNGM0ODVkNWMiLCJpYXQiOjE3NTAyNDYxOTgsIm5iZiI6MTc1MDI0NjE5OCwiZXhwIjoxOTA4MDMwOTU4LCJzdWIiOiIyNTE0OTQyIiwic2NvcGVzIjpbIm9yZGVyczpyZWFkIiwib3JkZXJzOndyaXRlIiwicHJvZHVjdHM6cmVhZCIsInByb2R1Y3RzOndyaXRlIiwic2hpcHBpbmdzOnJlYWQiLCJzaGlwcGluZ3M6d3JpdGUiLCJkaXNjb3VudHM6cmVhZCIsImRpc2NvdW50czp3cml0ZSIsInBheW91dHM6cmVhZCIsInJlZnVuZHM6cmVhZCIsInJlZnVuZHM6d3JpdGUiLCJzaG9wOnJlYWQiLCJzaG9wOndyaXRlIl19.vAcVL_POrlYkBsd4zUH8J3M4J3jXOKA25BaINzvK2w1i9HOYU9Cqr369vPiIEHGcFTS2ztlGzZd_GLWEy1_p2tKxGshw4OAiB3zqMj6vuLFa9Ln8BBCpGPXkTvnskSsE1b0cgfXveBptaQj0c4F_-B8KGM355tGMU8YhgWb5MbJQm04Ts83JSXAukIiNl2GkxORZHLfA1ZI2qpsRn2S6T5Od1DXVjmTXABTt0fEoVdMuNJYoVimHM5yYDv77fh0i7NinKk4QUKo_JzQvR7ShZ_AurQqgOOdBGLjKFWa787VXsvZaC133UZrvjNFacQC3bKVV29cz--pQo8oUvR8C4g
SHOPIER_CALLBACK_URL=http://localhost:3000/api/shopier/callback
SHOPIER_SUCCESS_URL=http://localhost:3000/subscription-success
SHOPIER_FAIL_URL=http://localhost:3000/subscription-failed

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Production için:**
```bash
# Production URLs
SHOPIER_CALLBACK_URL=https://yourdomain.com/api/shopier/callback
SHOPIER_SUCCESS_URL=https://yourdomain.com/subscription-success
SHOPIER_FAIL_URL=https://yourdomain.com/subscription-failed
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## 3. Shopier Dashboard Ayarları

### Webhook Callback URL'ini Ayarlama
1. Shopier dashboard'a gidin
2. **Geliştirici Ayarları** bölümüne gidin
3. Callback URL'ini ekleyin: `https://yourdomain.com/api/shopier/callback`
4. Başarılı ödeme URL'i: `https://yourdomain.com/subscription-success`
5. Başarısız ödeme URL'i: `https://yourdomain.com/subscription-failed`

## 4. Entegrasyon Özellikleri

### Desteklenen Özellikler
- ✅ Aylık premium üyelik ($25)
- ✅ Yıllık premium üyelik ($240)
- ✅ Güvenli Shopier ödeme sistemi
- ✅ Otomatik üyelik aktivasyonu
- ✅ Webhook callback işleme
- ✅ Başarılı/başarısız ödeme sayfaları
- ✅ Pop-up ödeme penceresi

### Ödeme Akışı
1. Kullanıcı premium üyelik planı seçer
2. Shopier ödeme formu pop-up'ta açılır
3. Kullanıcı Shopier'de güvenli ödeme yapar
4. Shopier webhook callback'i gönderir
5. Sistem kullanıcının üyeliğini otomatik günceller
6. Kullanıcı başarı/başarısızlık sayfasına yönlendirilir

## 5. API Endpoint'leri

### POST /api/shopier/payment
Ödeme işlemini başlatır.

**Request Body:**
```json
{
  "planId": "monthly" | "yearly",
  "userEmail": "user@example.com",
  "userName": "John",
  "userSurname": "Doe",
  "userId": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "paymentHTML": "<form>...</form>",
  "amount": 25
}
```

### POST /api/shopier/callback
Shopier'dan gelen webhook callback'lerini işler.

## 6. Test Etme

### Development Ortamında Test
1. `npm run dev` ile projeyi başlatın
2. Premium üyelik satın almayı deneyin
3. Shopier test kartlarını kullanın:
   - Test Kart: 4242 4242 4242 4242
   - CVV: Herhangi bir 3 haneli sayı
   - Son Kullanma: Gelecekteki herhangi bir tarih

### Production'a Geçiş
1. Environment değişkenlerini production URL'leri ile güncelleyin
2. Shopier dashboard'da production callback URL'lerini ayarlayın
3. SSL sertifikası aktif olduğundan emin olun

## 7. Güvenlik Önlemleri

### Önemli Güvenlik Notları
- API anahtarlarınızı asla public repository'lerde paylaşmayın
- Environment dosyalarını `.gitignore`'a ekleyin
- Production'da HTTPS kullanın
- Shopier callback'lerini doğrulayın

### Callback Doğrulama
Shopier callback'lerinin gerçekten Shopier'dan geldiğini doğrulamak için signature kontrolü yapmayı unutmayın.

## 8. Troubleshooting

### Yaygın Sorunlar

**Problem:** "Shopier API anahtarları yapılandırılmamış" hatası
**Çözüm:** `.env.local` dosyasında API anahtarlarının doğru tanımlandığından emin olun

**Problem:** Callback URL'e erişilemiyor
**Çözüm:** Shopier dashboard'da callback URL'inin doğru ayarlandığından emin olun

**Problem:** Ödeme sonrası üyelik güncellenmiyor
**Çözüm:** Callback endpoint'inin doğru çalıştığını ve veritabanı güncellemelerinin yapıldığını kontrol edin

## 9. Destek

### Shopier Desteği
- **Dokümantasyon:** [Geliştirici Portalı](https://developers.shopier.com)
- **Destek:** Shopier müşteri hizmetleri

### Proje Desteği
Bu entegrasyon ile ilgili sorularınız için proje geliştirici ekibi ile iletişime geçin.

---

**Not:** Bu entegrasyon Shopier API v1.0 kullanmaktadır. API güncellemeleri için düzenli olarak Shopier dokümantasyonunu kontrol edin. 