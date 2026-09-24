"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Kanban, List, Pencil, Plus, Trash2, ExternalLink } from "lucide-react";
import Toast from "../../Toast";
import Modal from "../../Modal";
import {
  PLATFORMS,
  STATUSES,
  calendarDays,
  platformLabel,
  statusLabel,
  type ContentItem,
  type ContentStatus,
  type Platform,
} from "@/lib/content";
import { monthKey, monthLabel, shiftMonth, todayKey } from "@/lib/finance";

type View = "board" | "calendar" | "list";

const emptyForm = (over: Partial<ContentItem> = {}) => ({
  id: "",
  title: "",
  platform: "tiktok" as Platform,
  status: "idea" as ContentStatus,
  scheduled_for: "" as string,
  notes: "",
  url: "",
  ...over,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any);

type Form = ReturnType<typeof emptyForm>;

const DAY_NAMES = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

export default function ContentPage() {
  const [items, setItems] = useState<ContentItem[] | null>(null);
  // Görünüm tercihi (?view= veya son seçim). Veri gelene kadar ekran "Yükleniyor" olduğundan hidrasyon farkı oluşmaz.
  const [view, setView] = useState<View>(() => {
    if (typeof window === "undefined") return "board";
    try {
      const v = new URLSearchParams(window.location.search).get("view") || localStorage.getItem("cp-content-view");
      if (v === "board" || v === "calendar" || v === "list") return v;
    } catch {}
    return "board";
  });
  const [month, setMonth] = useState(monthKey(todayKey()));
  const [form, setForm] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [platformFilter, setPlatformFilter] = useState<"all" | Platform>("all");
  const [toast, setToast] = useState("");
  const [bad, setBad] = useState(false);

  function flash(msg: string, isBad = false) {
    setBad(isBad);
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  }

  useEffect(() => {
    fetch("/api/control/content")
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .catch(() => {
        setItems([]);
        flash("Yüklenemedi.", true);
      });
  }, []);

  function changeView(v: View) {
    setView(v);
    try {
      localStorage.setItem("cp-content-view", v);
    } catch {}
  }

  const filtered = useMemo(() => {
    const t = q.trim().toLocaleLowerCase("tr");
    return (items || []).filter(
      (i) =>
        (platformFilter === "all" || i.platform === platformFilter) &&
        (!t || `${i.title} ${i.notes}`.toLocaleLowerCase("tr").includes(t))
    );
  }, [items, q, platformFilter]);

  async function persist(next: Form) {
    const isEdit = Boolean(next.id);
    const res = await fetch(`/api/control/content${isEdit ? `?id=${encodeURIComponent(next.id)}` : ""}`, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...next, scheduled_for: next.scheduled_for || null }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Kaydedilemedi.");
    }
    const { item } = await res.json();
    setItems((l) => {
      const rest = (l || []).filter((x) => x.id !== item.id);
      return isEdit ? (l || []).map((x) => (x.id === item.id ? item : x)) : [item, ...rest];
    });
    return item as ContentItem;
  }

  async function save() {
    if (!form) return;
    if (!form.title.trim()) {
      flash("Başlık zorunlu.", true);
      return;
    }
    setSaving(true);
    try {
      await persist(form);
      setForm(null);
      flash(form.id ? "Güncellendi." : "Eklendi.");
    } catch (e) {
      flash((e as Error).message, true);
    }
    setSaving(false);
  }

  async function moveTo(item: ContentItem, status: ContentStatus) {
    if (item.status === status) return;
    const before = items;
    setItems((l) => (l || []).map((x) => (x.id === item.id ? { ...x, status } : x)));
    try {
      await persist({ ...item, status, scheduled_for: item.scheduled_for || "" } as Form);
    } catch {
      setItems(before);
      flash("Taşınamadı.", true);
    }
  }

  async function remove(item: ContentItem) {
    if (!confirm(`"${item.title}" silinsin mi?`)) return;
    const res = await fetch(`/api/control/content?id=${encodeURIComponent(item.id)}`, { method: "DELETE" });
    if (res.ok) {
      setItems((l) => (l || []).filter((x) => x.id !== item.id));
      setForm(null);
      flash("Silindi.");
    } else flash("Silinemedi.", true);
  }

  const openNew = (over: Partial<ContentItem> = {}) => setForm(emptyForm(over));
  const openEdit = (i: ContentItem) => setForm(emptyForm({ ...i, scheduled_for: i.scheduled_for || "" } as Partial<ContentItem>));

  const today = todayKey();
  const days = useMemo(() => calendarDays(month), [month]);
  const byDate = useMemo(() => {
    const m: Record<string, ContentItem[]> = {};
    filtered.forEach((i) => {
      if (i.scheduled_for) (m[i.scheduled_for] ||= []).push(i);
    });
    return m;
  }, [filtered]);
  const undated = filtered.filter((i) => !i.scheduled_for && i.status !== "published");

  if (items === null) return <p className="cp-empty">Yükleniyor…</p>;

  const card = (i: ContentItem) => {
    const idx = STATUSES.findIndex((s) => s.id === i.status);
    return (
      <div
        key={i.id}
        className={`cp-kcard${dragId === i.id ? " is-drag" : ""}`}
        draggable
        onDragStart={() => setDragId(i.id)}
        onDragEnd={() => {
          setDragId(null);
          setOverCol(null);
        }}
      >
        <button className="cp-kcard-body" onClick={() => openEdit(i)}>
          <span className="cp-kcard-title">{i.title}</span>
          <span className="cp-chips">
            <span className={`cp-chip plat-${i.platform}`}>{platformLabel(i.platform)}</span>
            {i.scheduled_for && (
              <span className="cp-chip">
                {new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" }).format(new Date(i.scheduled_for + "T00:00:00"))}
              </span>
            )}
          </span>
        </button>
        <div className="cp-kcard-move">
          <button className="cp-icon-btn" disabled={idx === 0} onClick={() => moveTo(i, STATUSES[idx - 1].id)} aria-label="Önceki aşama">
            <ChevronLeft size={15} />
          </button>
          <button className="cp-icon-btn" disabled={idx === STATUSES.length - 1} onClick={() => moveTo(i, STATUSES[idx + 1].id)} aria-label="Sonraki aşama">
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="cp-head">
        <div>
          <h1>İçerik Planı</h1>
          <p>Fikirden yayına kadar tüm içeriklerin: pano, takvim ve liste görünümüyle.</p>
        </div>
        <div className="cp-head-actions">
          <button className="cp-btn cp-btn-primary" onClick={() => openNew()}>
            <Plus size={15} /> Yeni içerik
          </button>
        </div>
      </div>

      <div className="cp-toolbar">
        <div className="cp-seg" role="tablist" aria-label="Görünüm">
          <button className={view === "board" ? "is-on" : ""} onClick={() => changeView("board")}>
            <Kanban size={14} /> Pano
          </button>
          <button className={view === "calendar" ? "is-on" : ""} onClick={() => changeView("calendar")}>
            <CalendarDays size={14} /> Takvim
          </button>
          <button className={view === "list" ? "is-on" : ""} onClick={() => changeView("list")}>
            <List size={14} /> Liste
          </button>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flex: 1, justifyContent: "flex-end" }}>
          <select className="cp-input" style={{ maxWidth: 150 }} value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value as "all" | Platform)} aria-label="Platform filtresi">
            <option value="all">Tüm platformlar</option>
            {PLATFORMS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <input className="cp-input" style={{ maxWidth: 220 }} placeholder="Ara…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="İçeriklerde ara" />
        </div>
      </div>

      {view === "board" && (
        <div className="cp-board">
          {STATUSES.map((s) => {
            const col = filtered.filter((i) => i.status === s.id);
            return (
              <section
                key={s.id}
                className={`cp-col${overCol === s.id ? " is-over" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOverCol(s.id);
                }}
                onDragLeave={() => setOverCol((c) => (c === s.id ? null : c))}
                onDrop={() => {
                  const it = (items || []).find((x) => x.id === dragId);
                  if (it) moveTo(it, s.id);
                  setDragId(null);
                  setOverCol(null);
                }}
              >
                <div className="cp-col-head">
                  <span>
                    {s.label} <em>{col.length}</em>
                  </span>
                  <button className="cp-icon-btn" onClick={() => openNew({ status: s.id })} aria-label={`${s.label} aşamasına ekle`}>
                    <Plus size={15} />
                  </button>
                </div>
                <div className="cp-col-body">
                  {col.length === 0 ? <p className="cp-col-empty">Boş</p> : col.map(card)}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {view === "calendar" && (
        <section className="cp-card">
          <div className="cp-toolbar" style={{ marginBottom: 12 }}>
            <div className="cp-monthnav">
              <button className="cp-icon-btn" onClick={() => setMonth(shiftMonth(month, -1))} aria-label="Önceki ay">
                <ChevronLeft size={18} />
              </button>
              <strong>{monthLabel(month)}</strong>
              <button className="cp-icon-btn" onClick={() => setMonth(shiftMonth(month, 1))} aria-label="Sonraki ay">
                <ChevronRight size={18} />
              </button>
              {month !== monthKey(today) && (
                <button className="cp-btn cp-btn-ghost cp-btn-sm" onClick={() => setMonth(monthKey(today))}>
                  Bu ay
                </button>
              )}
            </div>
          </div>

          <div className="cp-cal">
            {DAY_NAMES.map((d) => (
              <div key={d} className="cp-cal-dow">
                {d}
              </div>
            ))}
            {days.map((d) => {
              const list = byDate[d.date] || [];
              return (
                <div
                  key={d.date}
                  className={`cp-cal-day${d.inMonth ? "" : " is-out"}${d.date === today ? " is-today" : ""}`}
                  onClick={(e) => {
                    if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.add) openNew({ scheduled_for: d.date, status: "scheduled" });
                  }}
                >
                  <span className="cp-cal-num" data-add="1">
                    {Number(d.date.slice(8))}
                  </span>
                  {list.slice(0, 3).map((i) => (
                    <button key={i.id} className={`cp-cal-item st-${i.status}`} onClick={() => openEdit(i)} title={`${i.title} · ${platformLabel(i.platform)} · ${statusLabel(i.status)}`}>
                      {i.title}
                    </button>
                  ))}
                  {list.length > 3 && <span className="cp-cal-more">+{list.length - 3} daha</span>}
                </div>
              );
            })}
          </div>
          <p className="cp-hint" style={{ margin: "12px 0 0" }}>Bir güne tıklayarak o tarihe içerik ekleyebilirsin.</p>

          {undated.length > 0 && (
            <div style={{ marginTop: 22 }}>
              <div className="cp-label">Tarihi olmayan içerikler ({undated.length})</div>
              <div className="cp-chips" style={{ marginTop: 8 }}>
                {undated.map((i) => (
                  <button key={i.id} className="cp-pick" onClick={() => openEdit(i)}>
                    {i.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {view === "list" && (
        <section className="cp-card">
          {filtered.length === 0 ? (
            <p className="cp-empty">İçerik bulunamadı.</p>
          ) : (
            <div className="cp-list">
              {[...filtered]
                .sort((a, b) => (a.scheduled_for || "9999").localeCompare(b.scheduled_for || "9999"))
                .map((i) => (
                  <div key={i.id} className="cp-row" style={{ alignItems: "center" }}>
                    <div className="cp-row-main">
                      <div className="cp-row-title">{i.title}</div>
                      <div className="cp-chips" style={{ marginTop: 6 }}>
                        <span className={`cp-chip plat-${i.platform}`}>{platformLabel(i.platform)}</span>
                        <span className="cp-chip is-accent">{statusLabel(i.status)}</span>
                        {i.scheduled_for && <span className="cp-chip">{i.scheduled_for}</span>}
                      </div>
                    </div>
                    <div className="cp-row-tools">
                      {i.url && (
                        <a href={i.url} target="_blank" rel="noopener" className="cp-icon-btn" aria-label="Bağlantıyı aç">
                          <ExternalLink size={16} />
                        </a>
                      )}
                      <button className="cp-icon-btn" onClick={() => openEdit(i)} aria-label="Düzenle">
                        <Pencil size={16} />
                      </button>
                      <button className="cp-icon-btn is-danger" onClick={() => remove(i)} aria-label="Sil">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </section>
      )}

      {form && (
        <Modal title={form.id ? "İçeriği düzenle" : "Yeni içerik"} onClose={() => setForm(null)}>
          <div className="cp-field">
            <label className="cp-label">Başlık / fikir</label>
            <input className="cp-input" placeholder="örn. Amazon FBA nedir? 30 sn'de anlat" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus />
          </div>
          <div className="cp-grid-2">
            <div className="cp-field">
              <label className="cp-label">Platform</label>
              <select className="cp-input" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>
                {PLATFORMS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="cp-field">
              <label className="cp-label">Aşama</label>
              <select className="cp-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="cp-field">
            <label className="cp-label">Yayın tarihi (opsiyonel)</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input type="date" className="cp-input" value={form.scheduled_for || ""} onChange={(e) => setForm({ ...form, scheduled_for: e.target.value })} />
              {form.scheduled_for && (
                <button className="cp-btn cp-btn-ghost cp-btn-sm" type="button" onClick={() => setForm({ ...form, scheduled_for: "" })}>
                  Temizle
                </button>
              )}
            </div>
          </div>
          <div className="cp-field">
            <label className="cp-label">Notlar / senaryo</label>
            <textarea className="cp-input" rows={4} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="cp-field">
            <label className="cp-label">Yayın linki (yayınlandıysa)</label>
            <input className="cp-input" placeholder="https://…" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
          </div>

          <div className="cp-actions">
            <button className="cp-btn cp-btn-primary" onClick={save} disabled={saving}>
              {saving ? "Kaydediliyor…" : "Kaydet"}
            </button>
            <button className="cp-btn cp-btn-ghost" onClick={() => setForm(null)}>
              Vazgeç
            </button>
            {form.id && (
              <button
                className="cp-btn cp-btn-danger"
                style={{ marginLeft: "auto" }}
                onClick={() => {
                  const it = (items || []).find((x) => x.id === form.id);
                  if (it) remove(it);
                }}
              >
                <Trash2 size={14} /> Sil
              </button>
            )}
          </div>
        </Modal>
      )}

      <Toast msg={toast} bad={bad} />
    </div>
  );
}
