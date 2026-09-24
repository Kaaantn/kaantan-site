"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Check, Download, Pencil, Plus, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import Toast from "../../Toast";
import Modal from "../../Modal";
import {
  CURRENCIES,
  categoriesFor,
  entriesToCsv,
  formatMoney,
  monthKey,
  monthLabel,
  monthlySeries,
  shiftMonth,
  summarize,
  todayKey,
  type Currency,
  type EntryType,
  type FinanceEntry,
} from "@/lib/finance";

type Filter = "all" | "income" | "expense" | "pending";

const emptyForm = (type: EntryType = "income", date = todayKey()) => ({
  id: "",
  type,
  amount: "",
  currency: "TRY" as Currency,
  category: "",
  title: "",
  note: "",
  entry_date: date,
  status: "paid" as "paid" | "pending",
});

export default function FinancePage() {
  const [entries, setEntries] = useState<FinanceEntry[] | null>(null);
  const [month, setMonth] = useState(monthKey(todayKey()));
  const [currency, setCurrency] = useState<Currency>("TRY");
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [catView, setCatView] = useState<EntryType>("income");
  const [form, setForm] = useState<ReturnType<typeof emptyForm> | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [bad, setBad] = useState(false);

  function flash(msg: string, isBad = false) {
    setBad(isBad);
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  }

  function load() {
    fetch("/api/control/finance")
      .then((r) => r.json())
      .then((d) => setEntries(d.entries || []))
      .catch(() => {
        setEntries([]);
        flash("Yüklenemedi.", true);
      });
  }
  useEffect(load, []);

  const presentCurrencies = useMemo(() => {
    const set = new Set<Currency>(["TRY"]);
    (entries || []).forEach((e) => set.add(e.currency));
    return CURRENCIES.filter((c) => set.has(c));
  }, [entries]);

  const monthEntries = useMemo(
    () => (entries || []).filter((e) => monthKey(e.entry_date) === month && e.currency === currency),
    [entries, month, currency]
  );
  const summary = useMemo(() => summarize(monthEntries, currency), [monthEntries, currency]);
  const prevSummary = useMemo(
    () => summarize((entries || []).filter((e) => monthKey(e.entry_date) === shiftMonth(month, -1)), currency),
    [entries, month, currency]
  );
  const series = useMemo(() => monthlySeries(entries || [], currency, month, 6), [entries, currency, month]);

  const visible = useMemo(() => {
    const t = q.trim().toLocaleLowerCase("tr");
    return monthEntries.filter((e) => {
      if (filter === "income" && e.type !== "income") return false;
      if (filter === "expense" && e.type !== "expense") return false;
      if (filter === "pending" && e.status !== "pending") return false;
      if (t && !`${e.title} ${e.category} ${e.note}`.toLocaleLowerCase("tr").includes(t)) return false;
      return true;
    });
  }, [monthEntries, filter, q]);

  async function save() {
    if (!form) return;
    const amount = Number(String(form.amount).replace(",", "."));
    if (!Number.isFinite(amount) || amount <= 0) {
      flash("Geçerli bir tutar gir.", true);
      return;
    }
    setSaving(true);
    const isEdit = Boolean(form.id);
    const res = await fetch(`/api/control/finance${isEdit ? `?id=${encodeURIComponent(form.id)}` : ""}`, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount }),
    });
    setSaving(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      flash(err.error || "Kaydedilemedi.", true);
      return;
    }
    const { entry } = await res.json();
    setEntries((list) => {
      const rest = (list || []).filter((e) => e.id !== entry.id);
      return [entry, ...rest].sort((a, b) => (a.entry_date < b.entry_date ? 1 : a.entry_date > b.entry_date ? -1 : 0));
    });
    setMonth(monthKey(entry.entry_date));
    setCurrency(entry.currency);
    setForm(null);
    flash(isEdit ? "Güncellendi." : "Kaydedildi.");
  }

  async function remove(e: FinanceEntry) {
    if (!confirm(`"${e.title || e.category}" kaydı silinsin mi?`)) return;
    const res = await fetch(`/api/control/finance?id=${encodeURIComponent(e.id)}`, { method: "DELETE" });
    if (res.ok) {
      setEntries((l) => (l || []).filter((x) => x.id !== e.id));
      flash("Silindi.");
    } else flash("Silinemedi.", true);
  }

  async function markPaid(e: FinanceEntry) {
    const res = await fetch(`/api/control/finance?id=${encodeURIComponent(e.id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...e, status: "paid" }),
    });
    if (res.ok) {
      const { entry } = await res.json();
      setEntries((l) => (l || []).map((x) => (x.id === entry.id ? entry : x)));
      flash("Ödendi olarak işaretlendi.");
    } else flash("Güncellenemedi.", true);
  }

  function exportCsv() {
    const rows = (entries || []).filter((e) => monthKey(e.entry_date) === month);
    const blob = new Blob([entriesToCsv(rows)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `gelir-gider-${month}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const openNew = (type: EntryType) =>
    setForm({ ...emptyForm(type, monthKey(todayKey()) === month ? todayKey() : `${month}-01`), currency });
  const openEdit = (e: FinanceEntry) =>
    setForm({
      id: e.id,
      type: e.type,
      amount: String(e.amount),
      currency: e.currency,
      category: e.category,
      title: e.title,
      note: e.note,
      entry_date: e.entry_date,
      status: e.status,
    });

  // ── grafik ölçeği ──
  const maxBar = Math.max(1, ...series.flatMap((s) => [s.income, s.expense]));
  const catRows = summary.byCategory[catView];
  const catMax = Math.max(1, ...catRows.map((c) => c.total));
  const catTotal = catView === "income" ? summary.income : summary.expense;

  const delta = (cur: number, prev: number) => {
    if (prev === 0) return cur === 0 ? null : 100;
    return Math.round(((cur - prev) / prev) * 100);
  };
  const incDelta = delta(summary.income, prevSummary.income);

  if (entries === null) return <p className="cp-empty">Yükleniyor…</p>;

  return (
    <div>
      <div className="cp-head">
        <div>
          <h1>Gelir – Gider</h1>
          <p>Kazandığın ve harcadığın her şey tek yerde. Bekleyen ödemeleri de burada takip et.</p>
        </div>
        <div className="cp-head-actions">
          <button className="cp-btn cp-btn-ghost" onClick={exportCsv}>
            <Download size={15} /> CSV
          </button>
          <button className="cp-btn cp-btn-ghost" onClick={() => openNew("expense")}>
            <Plus size={15} /> Gider
          </button>
          <button className="cp-btn cp-btn-primary" onClick={() => openNew("income")}>
            <Plus size={15} /> Gelir
          </button>
        </div>
      </div>

      <div className="cp-toolbar">
        <div className="cp-monthnav">
          <button className="cp-icon-btn" onClick={() => setMonth(shiftMonth(month, -1))} aria-label="Önceki ay">
            <ChevronLeft size={18} />
          </button>
          <strong>{monthLabel(month)}</strong>
          <button className="cp-icon-btn" onClick={() => setMonth(shiftMonth(month, 1))} aria-label="Sonraki ay">
            <ChevronRight size={18} />
          </button>
          {month !== monthKey(todayKey()) && (
            <button className="cp-btn cp-btn-ghost cp-btn-sm" onClick={() => setMonth(monthKey(todayKey()))}>
              Bu ay
            </button>
          )}
        </div>
        {presentCurrencies.length > 1 && (
          <div className="cp-seg" role="tablist" aria-label="Para birimi">
            {presentCurrencies.map((c) => (
              <button key={c} className={c === currency ? "is-on" : ""} onClick={() => setCurrency(c)}>
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="cp-stats is-4" style={{ marginBottom: 18 }}>
        <div className="cp-stat is-income">
          <span>Gelir</span>
          <b>{formatMoney(summary.income, currency)}</b>
          {incDelta !== null && (
            <em className={incDelta >= 0 ? "up" : "down"}>
              {incDelta >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {incDelta >= 0 ? "+" : ""}
              {incDelta}% geçen aya göre
            </em>
          )}
        </div>
        <div className="cp-stat is-expense">
          <span>Gider</span>
          <b>{formatMoney(summary.expense, currency)}</b>
        </div>
        <div className="cp-stat is-net">
          <span>Net</span>
          <b className={summary.net < 0 ? "neg" : ""}>{formatMoney(summary.net, currency)}</b>
        </div>
        <div className="cp-stat">
          <span>Bekleyen</span>
          <b style={{ fontSize: "1.25rem" }}>
            +{formatMoney(summary.pendingIncome, currency)}
            <br />−{formatMoney(summary.pendingExpense, currency)}
          </b>
        </div>
      </div>

      <div className="cp-two">
        <section className="cp-card">
          <div className="cp-card-head">
            <h2>Son 6 ay</h2>
            <div className="cp-legend">
              <i className="inc" /> Gelir <i className="exp" /> Gider
            </div>
          </div>
          <svg viewBox="0 0 480 190" className="cp-bars" role="img" aria-label="Son 6 ay gelir ve gider grafiği">
            {[0.25, 0.5, 0.75, 1].map((g) => (
              <line key={g} x1="0" x2="480" y1={150 - g * 130} y2={150 - g * 130} className="grid" />
            ))}
            {series.map((s, i) => {
              const x = 18 + i * 76;
              const hi = (s.income / maxBar) * 130;
              const he = (s.expense / maxBar) * 130;
              return (
                <g key={s.key} className={s.key === month ? "on" : ""} onClick={() => setMonth(s.key)} style={{ cursor: "pointer" }}>
                  <rect x={x} y={150 - hi} width="26" height={Math.max(hi, s.income > 0 ? 2 : 0)} rx="4" className="inc">
                    <title>{`${monthLabel(s.key)} gelir: ${formatMoney(s.income, currency)}`}</title>
                  </rect>
                  <rect x={x + 30} y={150 - he} width="26" height={Math.max(he, s.expense > 0 ? 2 : 0)} rx="4" className="exp">
                    <title>{`${monthLabel(s.key)} gider: ${formatMoney(s.expense, currency)}`}</title>
                  </rect>
                  <text x={x + 28} y="174" textAnchor="middle">
                    {s.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </section>

        <section className="cp-card">
          <div className="cp-card-head">
            <h2>Kategoriler</h2>
            <div className="cp-seg">
              <button className={catView === "income" ? "is-on" : ""} onClick={() => setCatView("income")}>
                Gelir
              </button>
              <button className={catView === "expense" ? "is-on" : ""} onClick={() => setCatView("expense")}>
                Gider
              </button>
            </div>
          </div>
          {catRows.length === 0 ? (
            <p className="cp-empty" style={{ padding: "22px 0" }}>Bu ay {catView === "income" ? "gelir" : "gider"} kaydı yok.</p>
          ) : (
            <div className="cp-catlist">
              {catRows.map((c) => (
                <div key={c.category} className="cp-cat">
                  <div className="cp-cat-top">
                    <span>{c.category}</span>
                    <b>{formatMoney(c.total, currency)}</b>
                  </div>
                  <div className="cp-cat-bar">
                    <i className={catView === "income" ? "inc" : "exp"} style={{ width: `${(c.total / catMax) * 100}%` }} />
                  </div>
                  <small>{catTotal > 0 ? Math.round((c.total / catTotal) * 100) : 0}%</small>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="cp-card">
        <div className="cp-card-head">
          <h2>Kayıtlar</h2>
          <span className="cp-chip">{visible.length} kayıt</span>
        </div>

        <div className="cp-toolbar" style={{ marginBottom: 14 }}>
          <div className="cp-seg">
            {(
              [
                ["all", "Hepsi"],
                ["income", "Gelir"],
                ["expense", "Gider"],
                ["pending", "Bekleyen"],
              ] as [Filter, string][]
            ).map(([id, label]) => (
              <button key={id} className={filter === id ? "is-on" : ""} onClick={() => setFilter(id)}>
                {label}
              </button>
            ))}
          </div>
          <input className="cp-input" style={{ maxWidth: 260 }} placeholder="Ara…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Kayıtlarda ara" />
        </div>

        {visible.length === 0 ? (
          <p className="cp-empty">
            {monthEntries.length === 0 ? "Bu ay için kayıt yok. İlk kaydını eklemek için Gelir veya Gider'e bas." : "Filtreye uyan kayıt yok."}
          </p>
        ) : (
          <div className="cp-list">
            {visible.map((e) => {
              const [, mm, dd] = e.entry_date.split("-");
              return (
                <div key={e.id} className={`cp-entry${e.status === "pending" ? " is-pending" : ""}`}>
                  <div className="cp-entry-date">
                    <b>{dd}</b>
                    <span>{new Intl.DateTimeFormat("tr-TR", { month: "short" }).format(new Date(2000, Number(mm) - 1, 1))}</span>
                  </div>
                  <div className="cp-row-main">
                    <div className="cp-row-title">{e.title || e.category}</div>
                    <div className="cp-chips" style={{ marginTop: 6 }}>
                      <span className={`cp-chip ${e.type === "income" ? "is-ok" : "is-accent"}`}>{e.category}</span>
                      {e.status === "pending" && <span className="cp-chip is-warn">bekliyor</span>}
                      {e.note && <span className="cp-chip is-muted">{e.note.length > 40 ? e.note.slice(0, 40) + "…" : e.note}</span>}
                    </div>
                  </div>
                  <div className={`cp-amount ${e.type === "income" ? "inc" : "exp"}`}>
                    {e.type === "income" ? "+" : "−"}
                    {formatMoney(e.amount, e.currency)}
                  </div>
                  <div className="cp-row-tools">
                    {e.status === "pending" && (
                      <button className="cp-icon-btn" onClick={() => markPaid(e)} aria-label="Ödendi işaretle" title="Ödendi işaretle">
                        <Check size={16} />
                      </button>
                    )}
                    <button className="cp-icon-btn" onClick={() => openEdit(e)} aria-label="Düzenle" title="Düzenle">
                      <Pencil size={16} />
                    </button>
                    <button className="cp-icon-btn is-danger" onClick={() => remove(e)} aria-label="Sil" title="Sil">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {form && (
        <Modal title={form.id ? "Kaydı düzenle" : form.type === "income" ? "Yeni gelir" : "Yeni gider"} onClose={() => setForm(null)}>
          <div className="cp-seg cp-seg-full" style={{ marginBottom: 16 }}>
            <button className={form.type === "income" ? "is-on" : ""} onClick={() => setForm({ ...form, type: "income", category: "" })}>
              Gelir
            </button>
            <button className={form.type === "expense" ? "is-on" : ""} onClick={() => setForm({ ...form, type: "expense", category: "" })}>
              Gider
            </button>
          </div>

          <div className="cp-grid-2">
            <div className="cp-field">
              <label className="cp-label">Tutar</label>
              <input
                className="cp-input"
                inputMode="decimal"
                placeholder="0,00"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                autoFocus
              />
            </div>
            <div className="cp-grid-2" style={{ gridTemplateColumns: "1fr 1.4fr" }}>
              <div className="cp-field">
                <label className="cp-label">Birim</label>
                <select className="cp-input" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value as Currency })}>
                  {CURRENCIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="cp-field">
                <label className="cp-label">Tarih</label>
                <input type="date" className="cp-input" value={form.entry_date} onChange={(e) => setForm({ ...form, entry_date: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="cp-field">
            <label className="cp-label">Kategori</label>
            <input
              className="cp-input"
              list="fin-cats"
              placeholder="Seç veya yaz"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
            <datalist id="fin-cats">
              {categoriesFor(form.type).map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            <div className="cp-chips" style={{ marginTop: 8 }}>
              {categoriesFor(form.type).map((c) => (
                <button key={c} type="button" className={`cp-pick${form.category === c ? " is-on" : ""}`} onClick={() => setForm({ ...form, category: c })}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="cp-field">
            <label className="cp-label">Başlık / kimden-kime</label>
            <input
              className="cp-input"
              placeholder={form.type === "income" ? "örn. Star Shoes Eylül reklam yönetimi" : "örn. Meta reklam bütçesi"}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="cp-field">
            <label className="cp-label">Not (opsiyonel)</label>
            <textarea className="cp-input" rows={2} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </div>

          <label className="cp-switch" style={{ marginBottom: 18 }}>
            <input type="checkbox" checked={form.status === "pending"} onChange={(e) => setForm({ ...form, status: e.target.checked ? "pending" : "paid" })} />
            <b />
            {form.type === "income" ? "Henüz tahsil edilmedi (bekliyor)" : "Henüz ödenmedi (bekliyor)"}
          </label>

          <div className="cp-actions">
            <button className="cp-btn cp-btn-primary" onClick={save} disabled={saving}>
              {saving ? "Kaydediliyor…" : "Kaydet"}
            </button>
            <button className="cp-btn cp-btn-ghost" onClick={() => setForm(null)}>
              Vazgeç
            </button>
          </div>
        </Modal>
      )}

      <Toast msg={toast} bad={bad} />
    </div>
  );
}
