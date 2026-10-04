"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, ArrowUpRight, Copy, RotateCw } from "lucide-react";
import Toast from "../../Toast";
import { PLATFORMS, type Lang, type Localized, type MediaKit, type PlatformStat } from "@/lib/mediaKit";

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
  const [lang, setLang] = useState<Lang>("tr");
  const [saved, setSaved] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [bad, setBad] = useState(false);
  const [origin] = useState(() => (typeof window === "undefined" ? "" : window.location.origin));
  const [now] = useState(() => Date.now()); // "kaç gündür güncellenmedi" hesabı için sabit an
  const loadedNumbers = useRef("");

  function flash(msg: string, isBad = false) {
    setBad(isBad);
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  }

  // Rakamlar ya da kitle bilgisi değişince güncelleme tarihi otomatik bugüne çekilir.
  const numbersKey = (k: MediaKit) => JSON.stringify([k.stats, k.tr.audience, k.en.audience]);

  useEffect(() => {
    fetch("/api/control/media-kit")
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Yüklenemedi");
        setKit(d.kit);
        setSaved(JSON.stringify(d.kit));
        loadedNumbers.current = numbersKey(d.kit);
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
  const loc = kit[lang];
  const setLoc = (patch: Partial<Localized>) => setKit({ ...kit, [lang]: { ...loc, ...patch } });
  const lines = (v: string[]) => v.join("\n");
  const toList = (v: string) => v.split("\n");
  const L = lang === "tr" ? "Türkçe" : "English";

  const linkTr = origin ? `${origin}/kit/${kit.shareToken}` : "";
  const linkEn = linkTr ? `${linkTr}?lang=en` : "";

  async function save() {
    if (!kit) return;
    setSaving(true);
    const body = { ...kit, updatedAt: numbersKey(kit) !== loadedNumbers.current ? todayISO() : kit.updatedAt };
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
    loadedNumbers.current = numbersKey(d.kit);
    flash("Kaydedildi — link anında güncel.");
  }

  async function copy(text: string, what: string) {
    try {
      await navigator.clipboard.writeText(text);
      flash(`${what} linki kopyalandı.`);
    } catch {
      flash("Kopyalanamadı, linki elle seç.", true);
    }
  }

  async function rotate() {
    if (!confirm("Link yenilensin mi? Daha önce gönderdiğin link ANINDA çalışmaz hale gelir, yenisini tekrar göndermen gerekir.")) return;
    setBusy(true);
    const res = await fetch("/api/control/media-kit/rotate-token", { method: "POST" });
    setBusy(false);
    if (!res.ok) return flash("Yenilenemedi.", true);
    const d = await res.json();
    setKit((k) => (k ? { ...k, shareToken: d.kit.shareToken } : k));
    setSaved((s) => JSON.stringify({ ...JSON.parse(s), shareToken: d.kit.shareToken }));
    flash("Yeni link oluşturuldu, eskisi artık çalışmıyor.");
  }

  const LangTabs = (
    <div className="cp-seg" role="tablist" aria-label="Düzenlenen dil">
      {(["tr", "en"] as Lang[]).map((l) => (
        <button key={l} role="tab" aria-selected={lang === l} className={lang === l ? "is-on" : ""} onClick={() => setLang(l)}>
          {l === "tr" ? "Türkçe" : "English"}
        </button>
      ))}
    </div>
  );

  return (
    <div>
      <div className="cp-head">
        <div>
          <h1>Medya Kiti</h1>
          <p>İş birliği için tek link, iki dil. Rakamları burada güncelle, link aynı kalır ve her zaman güncel görünür.</p>
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
            Rakamlar <b>{daysOld} gündür</b> güncellenmedi. Markalar eski sayı görmesin: takipçi ve son 28 gün izlenmelerini güncelle.
          </div>
        </div>
      )}

      <Card
        title="Paylaşım linkleri"
        hint="Bu linki bilen herkes kiti görür; başka kimse bulamaz. Arama motorlarında da çıkmaz. Sayfada ayrıca TR / EN geçiş düğmesi var."
        aside={
          <label className="cp-switch">
            <input type="checkbox" checked={kit.published} onChange={(e) => set({ published: e.target.checked })} aria-label="Link açık" />
            <b />
            {kit.published ? "Açık" : "Kapalı"}
          </label>
        }
      >
        {(
          [
            ["Türkçe", linkTr],
            ["English", linkEn],
          ] as const
        ).map(([name, url]) => (
          <div key={name} className="cp-field">
            <label className="cp-label">{name}</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input className="cp-input cp-mono" style={{ flex: "1 1 260px" }} readOnly value={url || "…"} onFocus={(e) => e.currentTarget.select()} aria-label={`${name} link`} />
              <button className="cp-btn cp-btn-primary" onClick={() => copy(url, name)}>
                <Copy size={15} /> Kopyala
              </button>
              <a className="cp-btn cp-btn-ghost" href={url} target="_blank" rel="noopener">
                Önizle <ArrowUpRight size={15} />
              </a>
            </div>
          </div>
        ))}
        <div className="cp-actions">
          <button className="cp-btn cp-btn-danger" onClick={rotate} disabled={busy}>
            <RotateCw size={15} /> Linki yenile
          </button>
        </div>
        {dirty && <p className="cp-hint" style={{ margin: "12px 0 0" }}>Önizleme son <b>kaydedilmiş</b> hâli gösterir; değişikliklerin yansıması için önce Kaydet.</p>}
      </Card>

      <Card
        title="Platform rakamları"
        hint="Her platform için iki rakam yeterli: takipçi sayısı ve son 28 gündeki toplam izlenme. “24.9K”, “1M+” gibi serbest yazabilirsin."
        aside={daysOld !== null ? <span className={`cp-chip${daysOld >= STALE_DAYS ? " is-warn" : ""}`}>{daysOld === 0 ? "bugün güncellendi" : `${daysOld} gün önce`}</span> : undefined}
      >
        <div className="cp-list">
          {kit.stats.map((s) => {
            const label = PLATFORMS.find((p) => p.id === s.id)?.label || s.id;
            return (
              <div key={s.id} className={`cp-row cp-platform${s.enabled ? "" : " is-off"}`} style={{ flexDirection: "column", alignItems: "stretch" }}>
                <label className="cp-switch" style={{ marginBottom: s.enabled ? 12 : 0 }}>
                  <input type="checkbox" checked={s.enabled} onChange={(e) => setStat(s.id, { enabled: e.target.checked })} aria-label={`${label} göster`} />
                  <b />
                  <strong style={{ color: "var(--ink)" }}>{label}</strong>
                </label>
                {s.enabled && (
                  <>
                    <div className="cp-grid-2">
                      <Field label="Takipçi">
                        <input className="cp-input" placeholder="24.9K" value={s.followers} onChange={(e) => setStat(s.id, { followers: e.target.value })} />
                      </Field>
                      <Field label="Son 28 gün izlenme">
                        <input className="cp-input" placeholder="1M+" value={s.views30} onChange={(e) => setStat(s.id, { views30: e.target.value })} />
                      </Field>
                    </div>
                    <div className="cp-grid-2">
                      <Field label="Kullanıcı adı">
                        <input className="cp-input" placeholder="@qkaantan" value={s.handle} onChange={(e) => setStat(s.id, { handle: e.target.value })} />
                      </Field>
                      <Field label="Profil linki (opsiyonel)">
                        <input className="cp-input" placeholder="https://…" value={s.url} onChange={(e) => setStat(s.id, { url: e.target.value })} />
                      </Field>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <Card title="Profil" aside={LangTabs} hint={`Aşağıdaki metin alanları ${L} sürümü içindir. Sayfayı dil düğmesiyle açan kişi hangi dili seçtiyse onu görür.`}>
        <div className="cp-grid-2">
          <Field label="Ad (iki dilde ortak)">
            <input className="cp-input" value={kit.name} onChange={(e) => set({ name: e.target.value })} />
          </Field>
          <Field label={`Konum (${L})`}>
            <input className="cp-input" value={loc.location} onChange={(e) => setLoc({ location: e.target.value })} />
          </Field>
        </div>
        <Field label={`Alt başlık (${L})`}>
          <input className="cp-input" value={loc.title} onChange={(e) => setLoc({ title: e.target.value })} />
        </Field>
        <Field label={`Hakkımda (${L})`}>
          <textarea className="cp-input" rows={4} value={loc.about} onChange={(e) => setLoc({ about: e.target.value })} />
        </Field>
        <Field label="Fotoğraf (iki dilde ortak)">
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

      <Card title="Kitle" aside={LangTabs} hint={`${L} sürümü. Boş bıraktığın satır sayfada görünmez. Bilgiler platform istatistiklerinden alınmalı.`}>
        <div className="cp-grid-3">
          <Field label="Ülkeler">
            <input
              className="cp-input"
              placeholder={lang === "tr" ? "Türkiye %92, Almanya %3" : "Türkiye 92%, Germany 3%"}
              value={loc.audience.countries}
              onChange={(e) => setLoc({ audience: { ...loc.audience, countries: e.target.value } })}
            />
          </Field>
          <Field label="Yaş aralığı">
            <input
              className="cp-input"
              placeholder={lang === "tr" ? "18-34 yaş %78" : "Ages 18-34: 78%"}
              value={loc.audience.age}
              onChange={(e) => setLoc({ audience: { ...loc.audience, age: e.target.value } })}
            />
          </Field>
          <Field label="Cinsiyet">
            <input
              className="cp-input"
              placeholder={lang === "tr" ? "Erkek %60 · Kadın %40" : "Male 60% · Female 40%"}
              value={loc.audience.gender}
              onChange={(e) => setLoc({ audience: { ...loc.audience, gender: e.target.value } })}
            />
          </Field>
        </div>
      </Card>

      <Card title="İçerik ve iş birliği" aside={LangTabs} hint={`${L} sürümü. Her satır ayrı bir madde olur.`}>
        <div className="cp-grid-2">
          <Field label="İçerik konuları">
            <textarea className="cp-input" rows={5} value={lines(loc.topics)} onChange={(e) => setLoc({ topics: toList(e.target.value) })} />
          </Field>
          <Field label="İş birliği formatları">
            <textarea className="cp-input" rows={5} value={lines(loc.formats)} onChange={(e) => setLoc({ formats: toList(e.target.value) })} />
          </Field>
        </div>
        <Field label="Paketler / fiyat notu (opsiyonel — boşsa sayfada hiç görünmez)">
          <textarea className="cp-input" rows={3} placeholder="Boş bırakırsan fiyat bilgisi paylaşılmaz." value={loc.rates} onChange={(e) => setLoc({ rates: e.target.value })} />
        </Field>
        <Field label="Çalıştığım markalar (iki dilde ortak, her satır bir marka)">
          <textarea className="cp-input" rows={4} value={lines(kit.brands)} onChange={(e) => set({ brands: toList(e.target.value) })} />
        </Field>
      </Card>

      <Card title="İletişim (iki dilde ortak)">
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
