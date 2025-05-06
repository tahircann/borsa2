/**
 * Tutarlı para biçimlendirme fonksiyonları
 * Bu fonksiyonlar hem sunucu hem istemci tarafında aynı biçimlendirmeyi sağlar
 */

/**
 * Para birimi olarak sayıyı biçimlendirir
 * @param amount Biçimlendirilecek sayı
 * @returns Biçimlendirilmiş para birimi dizesi
 */
export const formatCurrency = (amount: number): string => {
  // NaN veya undefined kontrolü
  if (amount === undefined || isNaN(amount)) {
    return '$0.00';
  }
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    console.error('Para birimi formatlanırken hata oluştu:', error);
    return '$0.00';
  }
};

/**
 * Yüzde değerini biçimlendirir
 * @param percent Biçimlendirilecek sayı
 * @returns Biçimlendirilmiş yüzde dizesi
 */
export const formatPercent = (percent: number): string => {
  // NaN veya undefined kontrolü
  if (percent === undefined || isNaN(percent)) {
    return '0.00%';
  }
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(percent / 100);
  } catch (error) {
    console.error('Yüzde formatlanırken hata oluştu:', error);
    return '0.00%';
  }
};

/**
 * Sayıyı biçimlendirir
 * @param number Biçimlendirilecek sayı
 * @returns Biçimlendirilmiş sayı dizesi
 */
export const formatNumber = (number: number): string => {
  // NaN veya undefined kontrolü
  if (number === undefined || isNaN(number)) {
    return '0';
  }
  
  try {
    return new Intl.NumberFormat('en-US').format(number);
  } catch (error) {
    console.error('Sayı formatlanırken hata oluştu:', error);
    return '0';
  }
}; 