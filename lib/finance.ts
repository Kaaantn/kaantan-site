// Gelir-gider modülü: tipler, kategoriler ve saf hesap fonksiyonları.
// Hem sunucu (API doğrulama) hem tarayıcı (özet/grafik) tarafından kullanılır; DB'ye dokunmaz.

export type EntryType = "income" | "expense";
export type Currency = "TRY" | "USD" | "EUR";
export type EntryStatus = "paid" | "pending";

export interface FinanceEntry {
  id: string;
  type: EntryType;
  amount: number;
  currency: Currency;
  category: string;
  title: string;
  note: string;
  entry_date: string; // YYYY-MM-DD
  status: EntryStatus;
  created_at?: string;
}

export const CURRENCIES: Currency[] = ["TRY", "USD", "EUR"];

export const INCOME_CATEGORIES = [
  "TikTok Canlı Yayın",
  "Oyun Geliri",
  "İş Birliği / Sponsorluk",
  "Meta Reklam Müşterisi",
  "Web / Yazılım Projesi",
  "Affiliate",
  "Diğer",
];

export const EXPENSE_CATEGORIES = [
  "Reklam Harcaması",
  "Yazılım / Abonelik",
  "Ekipman",
  "Vergi / Muhasebe",
  "Ulaşım / Yemek",
  "Diğer",
];

export const categoriesFor = (type: EntryType) => (type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES);

export function formatMoney(n: number, currency: Currency = "TRY"): string {
  try {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency,
      maximumFractionDigits: Math.abs(n) >= 1000 ? 0 : 2,
    }).format(n);
  } catch {
    return `${n.toFixed(2)} ${currency}`;
  }
}

export const monthKey = (date: string) => date.slice(0, 7); // YYYY-MM

export function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric" }).format(new Date(y, m - 1, 1));
}

export function shortMonthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("tr-TR", { month: "short" }).format(new Date(y, m - 1, 1));
}

export function shiftMonth(key: string, delta: number): string {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export interface Summary {
  income: number; // ödenmiş gelir
  expense: number; // ödenmiş gider
  net: number;
  pendingIncome: number; // bekleyen tahsilat
  pendingExpense: number; // bekleyen ödeme
  byCategory: { income: { category: string; total: number }[]; expense: { category: string; total: number }[] };
}

export function summarize(entries: FinanceEntry[], currency: Currency): Summary {
  const s: Summary = {
    income: 0,
    expense: 0,
    net: 0,
    pendingIncome: 0,
    pendingExpense: 0,
    byCategory: { income: [], expense: [] },
  };
  const cat: Record<EntryType, Record<string, number>> = { income: {}, expense: {} };

  for (const e of entries) {
    if (e.currency !== currency) continue;
    if (e.status === "pending") {
      if (e.type === "income") s.pendingIncome += e.amount;
      else s.pendingExpense += e.amount;
      continue;
    }
    if (e.type === "income") s.income += e.amount;
    else s.expense += e.amount;
    cat[e.type][e.category] = (cat[e.type][e.category] || 0) + e.amount;
  }
  s.net = s.income - s.expense;
  for (const t of ["income", "expense"] as EntryType[]) {
    s.byCategory[t] = Object.entries(cat[t])
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);
  }
  return s;
}

// Son N ayın (bitiş ayı dahil) ödenmiş gelir/gider serisi
export function monthlySeries(entries: FinanceEntry[], currency: Currency, endMonth: string, months = 6) {
  const keys: string[] = [];
  for (let i = months - 1; i >= 0; i--) keys.push(shiftMonth(endMonth, -i));
  return keys.map((key) => {
    let income = 0;
    let expense = 0;
    for (const e of entries) {
      if (e.currency !== currency || e.status !== "paid" || monthKey(e.entry_date) !== key) continue;
      if (e.type === "income") income += e.amount;
      else expense += e.amount;
    }
    return { key, label: shortMonthLabel(key), income, expense };
  });
}

// ── Sunucu tarafı doğrulama (POST/PUT gövdesi) ──
export type EntryInput = Omit<FinanceEntry, "id" | "created_at">;

export function parseEntryInput(body: unknown): { ok: true; value: EntryInput } | { ok: false; error: string } {
  const b = (body || {}) as Record<string, unknown>;
  const type = b.type === "income" || b.type === "expense" ? b.type : null;
  if (!type) return { ok: false, error: "Tür (gelir/gider) geçersiz." };

  const amount = Number(b.amount);
  if (!Number.isFinite(amount) || amount < 0 || amount > 1e12) return { ok: false, error: "Tutar geçersiz." };

  const currency = CURRENCIES.includes(b.currency as Currency) ? (b.currency as Currency) : "TRY";
  const date = typeof b.entry_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(b.entry_date) ? b.entry_date : null;
  if (!date) return { ok: false, error: "Tarih geçersiz." };

  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  return {
    ok: true,
    value: {
      type,
      amount: Math.round(amount * 100) / 100,
      currency,
      category: str(b.category, 80) || "Diğer",
      title: str(b.title, 160),
      note: str(b.note, 1000),
      entry_date: date,
      status: b.status === "pending" ? "pending" : "paid",
    },
  };
}

export function entriesToCsv(entries: FinanceEntry[]): string {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const head = ["Tarih", "Tür", "Kategori", "Başlık", "Tutar", "Para birimi", "Durum", "Not"];
  const rows = entries.map((e) => [
    e.entry_date,
    e.type === "income" ? "Gelir" : "Gider",
    e.category,
    e.title,
    e.amount,
    e.currency,
    e.status === "paid" ? "Ödendi" : "Bekliyor",
    e.note,
  ]);
  return "﻿" + [head, ...rows].map((r) => r.map(esc).join(";")).join("\r\n");
}
