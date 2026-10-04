"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, ArrowUpRight, Copy, RefreshCw, RotateCw } from "lucide-react";
import Toast from "../../Toast";
import { PLATFORMS, type MediaKit, type PlatformStat } from "@/lib/mediaKit";

const STALE_DAYS = 10;

async function uploadImage(file: File): Promise<string> {
  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const res = await fetch("/api/control/bio/assets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType: file.type, dataBase64: dataUrl.split(",")[1] }),
  });
  if (!res.ok) throw new Error("Yükleme başarısız");
  return (await res.json()).url as string;
}

function Card({ title, hint, children, aside }: { title: string; hint?: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section className="cp-card">
      <div className="cp-card-head">
        <h2>{title}</h2>
        {aside}
      </div>
      {hint && <p className="cp-hint">{hint}</p>}
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="cp-field">
      <label className="cp-label">{label}</label>
      {children}
    </div>
  );
}

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function MediaKitAdminPage() {
  const [kit, setKit] = useState<MediaKit | null>(null);
  const [saved, setSaved] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState("");
  const [toast, setToast] = useState("");
  const [bad, setBad] = useState(false);
  const [origin] = useState(() => (typeof window === "undefined" ? "" : window.location.origin));
  const [now] = useState(() => Date.now()); // "kaç gündür güncellenmedi" hesabı için sabit an
  const loadedStats = useRef("");

  function flash(msg: string, isBad = false) {
    setBad(isBad);
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  }

  const statsKey = (k: MediaKit) => JSON.stringify([k.stats, k.audience]);

  useEffect(() => {
    fetch("/api/control/media-kit")
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Yüklenemedi");
        setKit(d.kit);
        setSaved(JSON.stringify(d.kit));
        loadedStats.current = statsKey(d.kit);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  const dirty = useMemo(() => (kit ? JSON.stringify(kit) !== saved : false), [kit, saved]);
  const updatedAt = kit?.updatedAt;
  const daysOld = updatedAt ? Math.floor((now - new Date(updatedAt + "T00:00:00").getTime()) / 86400000) : null;

  if (error)
    return (
      <div className="cp-card">
        <h2>Medya kiti yüklenemedi</h2>
        <p className="cp-hint" style={{ marginTop: 8 }}>
          {error}. Veritabanında <code>media_kit</code> tablosu yoksa önce oluşturulması gerekir.
        </p>
      </div>
    );
  if (!kit) return <p className="cp-empty">Yükleniyor…</p>;

  const set = (patch: Partial<MediaKit>) => setKit({ ...kit, ...patch });
  const setStat = (id: string, patch: Partial<PlatformStat>) =>
    setKit({ ...kit, stats: kit.stats.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
  const lines = (v: string[]) => v.join("\n");
  const toList = (v: string) => v.split("\n");

  const link = origin ? `${origin}/kit/${kit.shareToken}` : "";

  async function save() {
    if (!kit) return;
    setSaving(true);
    // Rakamlar ya da kitle bilgisi değiştiyse güncelleme tarihi otomatik bugüne çekilir.
    const changedNumbers = statsKey(kit) !== loadedStats.current;
    const body = { ...kit, updatedAt: changedNumbers ? todayISO() : kit.updatedAt };
    const res = await fetch("/api/control/media-kit", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kit: body }),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      flash(d.error || "Kaydedilemedi.", true);
      return;
    }
    const d = await res.json();
    setKit(d.kit);
    setSaved(JSON.stringify(d.kit));
    loadedStats.current = statsKey(d.kit);
    flash("Kaydedildi — link anında güncel.");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      flash("Link kopyalandı.");
    } catch {
      flash("Kopyalanamadı, linki elle seç.", true);
    }
  }

  async function rotate() {
    if (!confirm("Link yenilensin mi? Daha önce gönderdiğin link ANINDA çalışmaz hale gelir, yenisini tekrar göndermen gerekir.")) return;
    setBusy("rotate");
    const res = await fetch("/api/control/media-kit/rotate-token", { method: "POST" });
    setBusy("");
    if (!res.ok) return flash("Yenilenemedi.", true);
    const d = await res.json();
    setKit((k) => (k ? { ...k, shareToken: d.kit.shareToken } : k));
    setSaved((s) => JSON.stringify({ ...JSON.parse(s), shareToken: d.kit.shareToken }));
    flash("Yeni link oluşturuldu, eskisi artık çalışmıyor.");
  }

  async function refreshInstagram() {
    setBusy("ig");
    const res = await fetch("/api/control/media-kit/refresh-instagram", { method: "POST" });
    setBusy("");
    const d = await res.json().catch(() => ({}));
    if (!res.ok) return flash(d.error || "Instagram'dan çekilemedi.", true);
    const s = d.stats as { followers: string; engagement: string; handle: string; sample: number };
    setKit((k) =>
      k
        ? {
            ...k,
            stats: k.stats.map((x) =>
              x.id === "instagram"
                ? {
                    ...x,
                    followers: s.followers,
                    engagement: s.engagement || x.engagement,
                    handle: x.handle || s.handle,
                    note: x.note || `Etkileşim: son ${s.sample} gönderi ortalaması`,
                  }
                : x
            ),
          }
        : k
    );
    flash("Instagram rakamları geldi. Kontrol edip Kaydet'e bas.");
  }

  return (
    <div>
      <div className="cp-head">
        <div>
          <h1>Medya Kiti</h1>
          <p>İş birliği için tek link. Rakamları burada güncelle, link aynı kalır ve her zaman güncel görünür.</p>
        </div>
        <div className="cp-head-actions">
          <button className="cp-btn cp-btn-primary" onClick={save} disabled={saving || !dirty}>
            {saving ? "Kaydediliyor…" : dirty ? "Kaydet" : "Kaydedildi"}
          </button>
        </div>
      </div>

      {daysOld !== null && daysOld >= STALE_DAYS && (
        <div className="cp-warn">
          <AlertTriangle size={18} />
          <div>
            Rakamlar <b>{daysOld} gündür</b> güncellenmedi. Markalar eski sayı görmesin: Instagram&apos;ı çek, diğerlerini elle güncelle.
          </div>
        </div>
      )}

      <Card
        title="Paylaşım linki"
        hint="Bu linki bilen herkes kiti görür; başka kimse bulamaz. Arama motorlarında da çıkmaz."
        aside={
          <label className="cp-switch">
            <input type="checkbox" checked={kit.published} onChange={(e) => set({ published: e.target.checked })} aria-label="Link açık" />
            <b />
            {kit.published ? "Açık" : "Kapalı"}
          </label>
        }
      >
        <div className="cp-linkbox">
          <input className="cp-input cp-mono" readOnly value={link || "…"} onFocus={(e) => e.currentTarget.select()} aria-label="Paylaşım linki" />
        </div>
        <div className="cp-actions">
          <button className="cp-btn cp-btn-primary" onClick={copyLink}>
            <Copy size={15} /> Kopyala
          </button>
          <a className="cp-btn cp-btn-ghost" href={link} target="_blank" rel="noopener">
            Önizle <ArrowUpRight size={15} />
          </a>
          <button className="cp-btn cp-btn-danger" onClick={rotate} disabled={busy === "rotate"}>
            <RotateCw size={15} /> Linki yenile
          </button>
        </div>
        {dirty && <p className="cp-hint" style={{ margin: "12px 0 0" }}>Önizleme son <b>kaydedilmiş</b> hâli gösterir; değişikliklerin yansıması için önce Kaydet.</p>}
      </Card>

      <Card title="Profil">
        <div className="cp-grid-2">
          <Field label="Ad">
            <input className="cp-input" value={kit.name} onChange={(e) => set({ name: e.target.value })} />
          </Field>
          <Field label="Konum">
            <input className="cp-input" value={kit.location} onChange={(e) => set({ location: e.target.value })} />
          </Field>
        </div>
        <Field label="Alt başlık">
          <input className="cp-input" value={kit.title} onChange={(e) => set({ title: e.target.value })} />
        </Field>
        <Field label="Hakkımda">
          <textarea className="cp-input" rows={4} value={kit.about} onChange={(e) => set({ about: e.target.value })} />
        </Field>
        <Field label="Fotoğraf">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={kit.photo} alt="" style={{ width: 54, height: 54, borderRadius: 14, objectFit: "cover", border: "1.5px solid var(--ink)" }} />
            <input
              type="file"
              accept="image/*"
              className="cp-file"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                try {
                  set({ photo: await uploadImage(f) });
                  flash("Fotoğraf yüklendi. Kaydet'e bas.");
                } catch {
                  flash("Yükleme başarısız.", true);
                }
              }}
            />
          </div>
        </Field>
      </Card>

      <Card
        title="Platform rakamları"
        hint="Rakamları “24.9K”, “%4,2” gibi serbest yazabilirsin. Instagram'ı otomatik çekebilirsin; TikTok ve Facebook'u uygulamadan bakıp elle gir."
        aside={daysOld !== null ? <span className={`cp-chip${daysOld >= STALE_DAYS ? " is-warn" : ""}`}>{daysOld === 0 ? "bugün güncellendi" : `${daysOld} gün önce`}</span> : undefined}
      >
        <div className="cp-list">
          {kit.stats.map((s) => {
            const label = PLATFORMS.find((p) => p.id === s.id)?.label || s.id;
            return (
              <div key={s.id} className={`cp-row cp-platform${s.enabled ? "" : " is-off"}`} style={{ flexDirection: "column", alignItems: "stretch" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                  <label className="cp-switch">
                    <input type="checkbox" checked={s.enabled} onChange={(e) => setStat(s.id, { enabled: e.target.checked })} aria-label={`${label} göster`} />
                    <b />
                    <strong style={{ color: "var(--ink)" }}>{label}</strong>
                  </label>
                  {s.id === "instagram" && (
                    <button className="cp-btn cp-btn-ghost cp-btn-sm" onClick={refreshInstagram} disabled={busy === "ig"}>
                      <RefreshCw size={14} /> {busy === "ig" ? "Çekiliyor…" : "Instagram'dan çek"}
                    </button>
                  )}
                </div>
                {s.enabled && (
                  <>
                    <div className="cp-grid-2">
                      <Field label="Kullanıcı adı">
                        <input className="cp-input" placeholder="@qkaantan" value={s.handle} onChange={(e) => setStat(s.id, { handle: e.target.value })} />
                      </Field>
                      <Field label="Profil linki">
                        <input className="cp-input" placeholder="https://…" value={s.url} onChange={(e) => setStat(s.id, { url: e.target.value })} />
                      </Field>
                    </div>
                    <div className="cp-grid-3">
                      <Field label="Takipçi">
                        <input className="cp-input" placeholder="24.9K" value={s.followers} onChange={(e) => setStat(s.id, { followers: e.target.value })} />
                      </Field>
                      <Field label="Ort. izlenme">
                        <input className="cp-input" placeholder="35K" value={s.avgViews} onChange={(e) => setStat(s.id, { avgViews: e.target.value })} />
                      </Field>
                      <Field label="Etkileşim oranı">
                        <input className="cp-input" placeholder="%4,2" value={s.engagement} onChange={(e) => setStat(s.id, { engagement: e.target.value })} />
                      </Field>
                    </div>
                    <Field label="Not (opsiyonel)">
                      <input className="cp-input" placeholder="örn. Son 30 gün ortalaması" value={s.note} onChange={(e) => setStat(s.id, { note: e.target.value })} />
                    </Field>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <Card title="Kitle" hint="Boş bıraktığın satır sayfada görünmez. Bilgiler platform istatistiklerinden alınmalı.">
        <div className="cp-grid-3">
          <Field label="Ülkeler">
            <input className="cp-input" placeholder="Türkiye %92, Almanya %3" value={kit.audience.countries} onChange={(e) => set({ audience: { ...kit.audience, countries: e.target.value } })} />
          </Field>
          <Field label="Yaş aralığı">
            <input className="cp-input" placeholder="18-34 yaş %78" value={kit.audience.age} onChange={(e) => set({ audience: { ...kit.audience, age: e.target.value } })} />
          </Field>
          <Field label="Cinsiyet">
            <input className="cp-input" placeholder="Erkek %60 · Kadın %40" value={kit.audience.gender} onChange={(e) => set({ audience: { ...kit.audience, gender: e.target.value } })} />
          </Field>
        </div>
      </Card>

      <Card title="İçerik ve iş birliği" hint="Her satır ayrı bir madde olur.">
        <div className="cp-grid-3">
          <Field label="İçerik konuları">
            <textarea className="cp-input" rows={5} value={lines(kit.topics)} onChange={(e) => set({ topics: toList(e.target.value) })} />
          </Field>
          <Field label="İş birliği formatları">
            <textarea className="cp-input" rows={5} value={lines(kit.formats)} onChange={(e) => set({ formats: toList(e.target.value) })} />
          </Field>
          <Field label="Çalıştığım markalar">
            <textarea className="cp-input" rows={5} value={lines(kit.brands)} onChange={(e) => set({ brands: toList(e.target.value) })} />
          </Field>
        </div>
        <Field label="Paketler / fiyat notu (opsiyonel — boşsa sayfada hiç görünmez)">
          <textarea className="cp-input" rows={3} placeholder="Boş bırakırsan fiyat bilgisi paylaşılmaz." value={kit.rates} onChange={(e) => set({ rates: e.target.value })} />
        </Field>
      </Card>

      <Card title="İletişim">
        <div className="cp-grid-2">
          <Field label="E-posta">
            <input className="cp-input" value={kit.email} onChange={(e) => set({ email: e.target.value })} />
          </Field>
          <Field label="WhatsApp (ülke koduyla, sadece rakam)">
            <input className="cp-input" placeholder="905422979212" value={kit.whatsapp} onChange={(e) => set({ whatsapp: e.target.value })} />
          </Field>
        </div>
      </Card>

      {dirty && (
        <div className="cp-savebar">
          <span>Kaydedilmemiş değişiklikler var</span>
          <button className="cp-btn cp-btn-primary" onClick={save} disabled={saving}>
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      )}

      <Toast msg={toast} bad={bad} />
    </div>
  );
}
