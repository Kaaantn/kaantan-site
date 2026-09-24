// İçerik planı modülü: tipler, durumlar, platformlar ve doğrulama.

export const STATUSES = [
  { id: "idea", label: "Fikir" },
  { id: "script", label: "Senaryo" },
  { id: "shoot", label: "Çekim" },
  { id: "edit", label: "Kurgu" },
  { id: "scheduled", label: "Planlandı" },
  { id: "published", label: "Yayında" },
] as const;

export type ContentStatus = (typeof STATUSES)[number]["id"];

export const PLATFORMS = [
  { id: "tiktok", label: "TikTok" },
  { id: "instagram", label: "Instagram" },
  { id: "youtube", label: "YouTube" },
  { id: "blog", label: "Blog" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "other", label: "Diğer" },
] as const;

export type Platform = (typeof PLATFORMS)[number]["id"];

export interface ContentItem {
  id: string;
  title: string;
  platform: Platform;
  status: ContentStatus;
  scheduled_for: string | null; // YYYY-MM-DD
  notes: string;
  url: string;
  sort_order?: number;
  created_at?: string;
}

export const statusLabel = (id: string) => STATUSES.find((s) => s.id === id)?.label || id;
export const platformLabel = (id: string) => PLATFORMS.find((p) => p.id === id)?.label || id;

export type ContentInput = Omit<ContentItem, "id" | "created_at" | "sort_order">;

export function parseContentInput(body: unknown): { ok: true; value: ContentInput } | { ok: false; error: string } {
  const b = (body || {}) as Record<string, unknown>;
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

  const title = str(b.title, 200);
  if (!title) return { ok: false, error: "Başlık zorunlu." };

  const platform = PLATFORMS.some((p) => p.id === b.platform) ? (b.platform as Platform) : "other";
  const status = STATUSES.some((s) => s.id === b.status) ? (b.status as ContentStatus) : "idea";
  const scheduled_for =
    typeof b.scheduled_for === "string" && /^\d{4}-\d{2}-\d{2}$/.test(b.scheduled_for) ? b.scheduled_for : null;

  return {
    ok: true,
    value: { title, platform, status, scheduled_for, notes: str(b.notes, 4000), url: str(b.url, 500) },
  };
}

// Takvim ızgarası: verilen ay için Pazartesi başlangıçlı 6x7 gün listesi
export function calendarDays(monthKey: string): { date: string; inMonth: boolean }[] {
  const [y, m] = monthKey.split("-").map(Number);
  const first = new Date(y, m - 1, 1);
  const offset = (first.getDay() + 6) % 7; // Pzt=0
  const start = new Date(y, m - 1, 1 - offset);
  const out: { date: string; inMonth: boolean }[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    out.push({
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      inMonth: d.getMonth() === m - 1,
    });
  }
  return out;
}
