// Ported from .eleventy.js's "tarih" and "isoDate" filters.

const AYLAR = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

export function tarih(value: string | number | Date): string {
  const d = new Date(value);
  return `${d.getDate()} ${AYLAR[d.getMonth()]} ${d.getFullYear()}`;
}

export function isoDate(value: string | number | Date): string {
  return new Date(value).toISOString().split("T")[0];
}
