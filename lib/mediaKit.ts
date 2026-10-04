import { randomBytes, timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

// Medya kiti: tek satırlık JSON belge (media_kit tablosu, id=1).
// Herkese açık sayfa yalnızca gizli bir kodla (shareToken) açılır.
// Rakamlar tamamen elle girilir: platform başına takipçi + son 28 gün izlenme.
// Metinler iki dilde (tr/en) tutulur; rakamlar, kullanıcı adları ve iletişim ortaktır.

export const PLATFORMS = [
  { id: "tiktok", label: "TikTok" },
  { id: "instagram", label: "Instagram" },
  { id: "youtube", label: "YouTube Shorts" },
  { id: "facebook", label: "Facebook" },
] as const;

export type PlatformId = (typeof PLATFORMS)[number]["id"];
export type Lang = "tr" | "en";

export interface PlatformStat {
  id: PlatformId;
  enabled: boolean;
  handle: string; // @qkaantan
  url: string;
  followers: string; // "24.9K" gibi serbest metin
  views30: string; // son 28 gün toplam izlenme, örn. "1M+"
}

export interface Localized {
  location: string;
  title: string; // alt başlık
  about: string;
  audience: { countries: string; age: string; gender: string };
  topics: string[]; // içerik konuları
  formats: string[]; // iş birliği formatları
  rates: string; // opsiyonel serbest metin (boşsa gösterilmez)
}

export interface MediaKit {
  shareToken: string;
  published: boolean; // false ise link açılmaz (geçici kapatma)
  name: string;
  photo: string;
  stats: PlatformStat[];
  brands: string[]; // marka adları iki dilde aynı
  email: string;
  whatsapp: string;
  updatedAt: string; // YYYY-MM-DD (rakamların son güncelleme tarihi)
  tr: Localized;
  en: Localized;
}

export const emptyStat = (id: PlatformId): PlatformStat => ({
  id,
  enabled: true,
  handle: "",
  url: "",
  followers: "",
  views30: "",
});

export function newToken(): string {
  return randomBytes(18).toString("hex"); // 36 karakter, tahmin edilemez
}

export const todayISO = () => {
  const d = new Date(Date.now() + 3 * 3600 * 1000); // Türkiye saati
  return d.toISOString().slice(0, 10);
};

const emptyLocalized = (): Localized => ({
  location: "",
  title: "",
  about: "",
  audience: { countries: "", age: "", gender: "" },
  topics: [],
  formats: [],
  rates: "",
});

export function defaultKit(): MediaKit {
  return {
    shareToken: newToken(),
    published: true,
    name: "Kaan Tan",
    photo: "/bio/profil.jpg",
    stats: PLATFORMS.map((p) => ({
      ...emptyStat(p.id),
      handle: p.id === "facebook" ? "" : "@qkaantan",
      // Facebook'ta son ay en az 1 milyon izlenme (kullanıcının beyanı; kesin rakam panelden girilir)
      views30: p.id === "facebook" ? "1M+" : "",
    })),
    brands: [],
    email: "kaantanpr@gmail.com",
    whatsapp: "905422979212",
    updatedAt: todayISO(),
    tr: {
      location: "İstanbul",
      title: "İçerik üreticisi · Teknoloji & yapay zeka",
      about:
        "İstanbul merkezli içerik üreticisiyim. Instagram, TikTok, YouTube ve Facebook'ta teknoloji ve yapay zeka içerikleri paylaşıyorum. Aynı zamanda yazılım geliştirici ve Meta/TikTok reklam yöneticisiyim.",
      audience: { countries: "", age: "", gender: "" },
      topics: ["Yapay zeka araçları", "Teknoloji", "Dijital üretkenlik"],
      formats: ["Reels / Shorts / TikTok videosu", "Hikaye paylaşımı", "Canlı yayın", "Ürün tanıtımı"],
      rates: "",
    },
    en: {
      location: "Istanbul, Türkiye",
      title: "Content creator · Technology & AI",
      about:
        "I'm an Istanbul-based content creator sharing technology and AI content on Instagram, TikTok, YouTube and Facebook. I'm also a software developer and a Meta/TikTok ads manager.",
      audience: { countries: "", age: "", gender: "" },
      topics: ["AI tools", "Technology", "Digital productivity"],
      formats: ["Reels / Shorts / TikTok video", "Story post", "Live stream", "Product promotion"],
      rates: "",
    },
  };
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const list = (v: unknown, maxItems: number, maxLen: number) =>
  Array.isArray(v) ? v.map((x) => str(x, maxLen)).filter(Boolean).slice(0, maxItems) : [];

function sanitizeLocalized(input: unknown): Localized {
  const b = (input || {}) as Record<string, unknown>;
  const a = (b.audience || {}) as Record<string, unknown>;
  return {
    location: str(b.location, 80),
    title: str(b.title, 160),
    about: str(b.about, 1500),
    audience: { countries: str(a.countries, 200), age: str(a.age, 120), gender: str(a.gender, 120) },
    topics: list(b.topics, 12, 60),
    formats: list(b.formats, 12, 80),
    rates: str(b.rates, 1200),
  };
}

// Panelden gelen veriyi temizler. shareToken burada değişmez (yalnızca rotate-token ile).
export function sanitizeKit(input: unknown, current: MediaKit): MediaKit {
  const b = (input || {}) as Record<string, unknown>;
  const incoming = Array.isArray(b.stats) ? (b.stats as Record<string, unknown>[]) : [];

  const stats = PLATFORMS.map((p) => {
    const s = incoming.find((x) => x.id === p.id) || {};
    const base = current.stats.find((x) => x.id === p.id) || emptyStat(p.id);
    return {
      id: p.id,
      enabled: typeof s.enabled === "boolean" ? s.enabled : base.enabled,
      handle: str(s.handle, 60),
      url: str(s.url, 300),
      followers: str(s.followers, 30),
      views30: str(s.views30, 30),
    } as PlatformStat;
  });

  const date = str(b.updatedAt, 10);
  return {
    ...current,
    published: typeof b.published === "boolean" ? b.published : current.published,
    name: str(b.name, 80) || current.name,
    photo: str(b.photo, 400) || current.photo,
    stats,
    brands: list(b.brands, 30, 60),
    email: str(b.email, 120),
    whatsapp: str(b.whatsapp, 30).replace(/[^\d]/g, ""),
    updatedAt: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : todayISO(),
    tr: sanitizeLocalized(b.tr),
    en: sanitizeLocalized(b.en),
  };
}

export async function getKit(): Promise<MediaKit | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("media_kit").select("data").eq("id", 1).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const saved = data.data as Partial<MediaKit>;
  const base = defaultKit();
  return {
    ...base,
    ...saved,
    // eksik alanlar için güvenli birleştirme (eski/yarım kayıtlar sayfayı bozmasın)
    stats: PLATFORMS.map((p) => ({
      ...emptyStat(p.id),
      ...(saved.stats || []).find((s) => s.id === p.id),
    })) as PlatformStat[],
    tr: { ...emptyLocalized(), ...(saved.tr || {}), audience: { ...emptyLocalized().audience, ...(saved.tr?.audience || {}) } },
    en: { ...emptyLocalized(), ...(saved.en || {}), audience: { ...emptyLocalized().audience, ...(saved.en?.audience || {}) } },
  } as MediaKit;
}

export async function getOrCreateKit(): Promise<MediaKit> {
  const existing = await getKit();
  if (existing) return existing;
  const fresh = defaultKit();
  await saveKit(fresh);
  return fresh;
}

export async function saveKit(kit: MediaKit): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("media_kit")
    .upsert({ id: 1, data: kit, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export function tokenMatches(given: string, real: string): boolean {
  const a = Buffer.from(given);
  const b = Buffer.from(real);
  return a.length === b.length && timingSafeEqual(a, b);
}
