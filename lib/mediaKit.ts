import { randomBytes, timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

// Medya kiti: tek satırlık JSON belge (media_kit tablosu, id=1).
// Herkese açık sayfa yalnızca gizli bir kodla (share_token) açılır.

export const PLATFORMS = [
  { id: "tiktok", label: "TikTok" },
  { id: "instagram", label: "Instagram" },
  { id: "youtube", label: "YouTube Shorts" },
  { id: "facebook", label: "Facebook" },
] as const;

export type PlatformId = (typeof PLATFORMS)[number]["id"];

export interface PlatformStat {
  id: PlatformId;
  enabled: boolean;
  handle: string; // @qkaantan
  url: string;
  followers: string; // "24.9K" gibi serbest metin
  avgViews: string;
  engagement: string; // "%4,2"
  note: string;
}

export interface MediaKit {
  shareToken: string;
  published: boolean; // false ise link açılmaz (geçici kapatma)
  name: string;
  title: string; // alt başlık
  location: string;
  photo: string;
  about: string;
  stats: PlatformStat[];
  audience: { countries: string; age: string; gender: string };
  topics: string[]; // içerik konuları
  formats: string[]; // iş birliği formatları
  brands: string[]; // çalıştığı markalar
  rates: string; // opsiyonel serbest metin (boşsa gösterilmez)
  email: string;
  whatsapp: string;
  updatedAt: string; // YYYY-MM-DD (rakamların son güncelleme tarihi)
}

export const emptyStat = (id: PlatformId): PlatformStat => ({
  id,
  enabled: id !== "facebook",
  handle: "",
  url: "",
  followers: "",
  avgViews: "",
  engagement: "",
  note: "",
});

export function newToken(): string {
  return randomBytes(18).toString("hex"); // 36 karakter, tahmin edilemez
}

export const todayISO = () => {
  const d = new Date(Date.now() + 3 * 3600 * 1000); // Türkiye saati
  return d.toISOString().slice(0, 10);
};

export function defaultKit(): MediaKit {
  return {
    shareToken: newToken(),
    published: true,
    name: "Kaan Tan",
    title: "İçerik üreticisi · Teknoloji & yapay zeka",
    location: "İstanbul",
    photo: "/bio/profil.jpg",
    about:
      "İstanbul merkezli içerik üreticisiyim. Instagram, TikTok ve YouTube'da @qkaantan olarak teknoloji ve yapay zeka içerikleri paylaşıyorum. Aynı zamanda yazılım geliştirici ve Meta/TikTok reklam yöneticisiyim.",
    stats: PLATFORMS.map((p) => ({
      ...emptyStat(p.id),
      handle: p.id === "facebook" ? "" : "@qkaantan",
    })),
    audience: { countries: "", age: "", gender: "" },
    topics: ["Yapay zeka araçları", "Teknoloji", "Dijital üretkenlik"],
    formats: ["Reels / Shorts / TikTok videosu", "Hikaye paylaşımı", "Canlı yayın", "Ürün tanıtımı"],
    brands: [],
    rates: "",
    email: "kaantanpr@gmail.com",
    whatsapp: "905422979212",
    updatedAt: todayISO(),
  };
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const list = (v: unknown, maxItems: number, maxLen: number) =>
  Array.isArray(v) ? v.map((x) => str(x, maxLen)).filter(Boolean).slice(0, maxItems) : [];

// Panelden gelen veriyi temizler. shareToken ve published burada değişmez
// (token yalnızca rotateToken ile, yayın durumu ayrı bayrakla güncellenir).
export function sanitizeKit(input: unknown, current: MediaKit): MediaKit {
  const b = (input || {}) as Record<string, unknown>;
  const a = (b.audience || {}) as Record<string, unknown>;
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
      avgViews: str(s.avgViews, 30),
      engagement: str(s.engagement, 30),
      note: str(s.note, 200),
    } as PlatformStat;
  });

  return {
    ...current,
    published: typeof b.published === "boolean" ? b.published : current.published,
    name: str(b.name, 80) || current.name,
    title: str(b.title, 160),
    location: str(b.location, 80),
    photo: str(b.photo, 400) || current.photo,
    about: str(b.about, 1500),
    stats,
    audience: { countries: str(a.countries, 200), age: str(a.age, 120), gender: str(a.gender, 120) },
    topics: list(b.topics, 12, 60),
    formats: list(b.formats, 12, 80),
    brands: list(b.brands, 30, 60),
    rates: str(b.rates, 1200),
    email: str(b.email, 120),
    whatsapp: str(b.whatsapp, 30).replace(/[^\d]/g, ""),
    updatedAt: /^\d{4}-\d{2}-\d{2}$/.test(str(b.updatedAt, 10)) ? str(b.updatedAt, 10) : todayISO(),
  };
}

export async function getKit(): Promise<MediaKit | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("media_kit").select("data").eq("id", 1).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { ...defaultKit(), ...(data.data as Partial<MediaKit>) } as MediaKit;
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

// ── Instagram'dan otomatik rakam ──
const compact = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1).replace(".", ",")}M`
    : n >= 10_000
      ? `${(n / 1000).toFixed(1).replace(".", ",")}K`
      : n.toLocaleString("tr-TR");

export async function fetchInstagramStats(): Promise<{
  followers: string;
  engagement: string;
  handle: string;
  sample: number;
}> {
  const token = process.env.IG_PAGE_ACCESS_TOKEN?.trim();
  if (!token) throw new Error("IG_PAGE_ACCESS_TOKEN tanımlı değil");
  const base = "https://graph.instagram.com/v21.0";

  const me = await fetch(`${base}/me?fields=username,followers_count&access_token=${token}`).then((r) => r.json());
  if (me.error) throw new Error(me.error.message || "Instagram profil okunamadı");
  const media = await fetch(`${base}/me/media?fields=like_count,comments_count&limit=25&access_token=${token}`).then((r) =>
    r.json()
  );
  if (media.error) throw new Error(media.error.message || "Instagram gönderileri okunamadı");

  const followers = Number(me.followers_count) || 0;
  const posts = (media.data || []) as { like_count?: number; comments_count?: number }[];
  const sample = posts.length;
  let engagement = "";
  if (followers > 0 && sample > 0) {
    const avg = posts.reduce((n, p) => n + (p.like_count || 0) + (p.comments_count || 0), 0) / sample;
    engagement = `%${((avg / followers) * 100).toFixed(1).replace(".", ",")}`;
  }
  return { followers: compact(followers), engagement, handle: `@${me.username}`, sample };
}
