"use client";

import { useEffect, useState } from "react";
import { ArrowUp, ArrowDown, Pencil, Trash2, Plus, ArrowUpRight } from "lucide-react";
import type { BioConfig, BioLink } from "@/lib/bio";
import Toast from "../../Toast";

const ICON_OPTIONS = [
  "image", "mic", "search", "star", "shopping-bag", "globe",
  "message-circle", "activity", "terminal", "file-text", "kt-logo",
];

const SOCIAL_PLATFORMS = ["youtube", "tiktok", "instagram"] as const;

function Card({ title, children, aside }: { title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section className="cp-card">
      <div className="cp-card-head">
        <h2>{title}</h2>
        {aside}
      </div>
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

async function uploadImage(file: File): Promise<string> {
  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const dataBase64 = dataUrl.split(",")[1];
  const res = await fetch("/api/control/bio/assets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType: file.type, dataBase64 }),
  });
  if (!res.ok) throw new Error("Yükleme başarısız");
  const data = await res.json();
  return data.url as string;
}

export default function BioAdminPage() {
  const [bio, setBio] = useState<BioConfig | null>(null);
  const [status, setStatus] = useState<string>("");
  const [bad, setBad] = useState(false);
  const [editingLink, setEditingLink] = useState<BioLink | null>(null);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  useEffect(() => {
    fetch("/api/public/bio-config")
      .then((r) => r.json())
      .then(setBio)
      .catch(() => {
        setBad(true);
        setStatus("Yüklenemedi.");
      });
  }, []);

  async function save(next: BioConfig, msg: string) {
    setBio(next);
    const res = await fetch("/api/public/bio-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config: next }),
    });
    setBad(!res.ok);
    setStatus(res.ok ? msg : "Kaydedilemedi.");
    if (res.ok) setPreviewKey((k) => k + 1);
    setTimeout(() => setStatus(""), 2500);
  }

  if (!bio) return <p className="cp-empty">Yükleniyor…</p>;

  function updateLinks(links: BioLink[]) {
    save({ ...bio!, links }, "Kaydedildi.");
  }

  function moveLink(index: number, dir: -1 | 1) {
    const links = [...bio!.links];
    const target = index + dir;
    if (target < 0 || target >= links.length) return;
    [links[index], links[target]] = [links[target], links[index]];
    updateLinks(links);
  }

  function deleteLink(id: string) {
    if (!confirm("Bu link silinsin mi?")) return;
    updateLinks(bio!.links.filter((l) => l.id !== id));
  }

  function upsertLink(link: BioLink) {
    const exists = bio!.links.some((l) => l.id === link.id);
    const links = exists ? bio!.links.map((l) => (l.id === link.id ? link : l)) : [...bio!.links, link];
    updateLinks(links);
    setShowLinkForm(false);
    setEditingLink(null);
  }

  return (
    <div>
      <div className="cp-head">
        <div>
          <h1>Bio Sayfası</h1>
          <p>Alanlardan çıktığında otomatik kaydedilir. Sağdaki önizleme canlı sayfayı gösterir.</p>
        </div>
        <div className="cp-head-actions">
          <a href="/bio" target="_blank" rel="noopener" className="cp-btn cp-btn-ghost">
            /bio sayfasını aç <ArrowUpRight size={15} />
          </a>
        </div>
      </div>

      <div className="cp-split">
        <div>
          <Card title="Profil">
            <div className="cp-grid-2">
              <Field label="Görünen Ad">
                <input className="cp-input" value={bio.displayName || ""} onChange={(e) => setBio({ ...bio, displayName: e.target.value })} onBlur={() => save(bio, "Kaydedildi.")} />
              </Field>
              <Field label="Konum">
                <input className="cp-input" value={bio.location || ""} onChange={(e) => setBio({ ...bio, location: e.target.value })} onBlur={() => save(bio, "Kaydedildi.")} />
              </Field>
            </div>
            <Field label="Bio">
              <textarea className="cp-input" rows={3} value={bio.bio || ""} onChange={(e) => setBio({ ...bio, bio: e.target.value })} onBlur={() => save(bio, "Kaydedildi.")} />
            </Field>
            <div className="cp-grid-2">
              <Field label="Banner Rengi">
                <div style={{ display: "flex", gap: 8 }}>
                  <input type="color" value={bio.bannerColor || "#E5471B"} onChange={(e) => save({ ...bio, bannerColor: e.target.value }, "Kaydedildi.")} className="cp-color" style={{ width: 64, flexShrink: 0 }} />
                  <input className="cp-input" value={bio.bannerColor || ""} onChange={(e) => setBio({ ...bio, bannerColor: e.target.value })} onBlur={() => save(bio, "Kaydedildi.")} />
                </div>
              </Field>
              <Field label="Profil Fotoğrafı">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {bio.avatar && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={bio.avatar} alt="" style={{ width: 46, height: 46, borderRadius: "50%", objectFit: "cover", border: "1.5px solid var(--ink)" }} />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="cp-file"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const url = await uploadImage(file);
                        save({ ...bio, avatar: url }, "Fotoğraf güncellendi.");
                      } catch {
                        setBad(true);
                        setStatus("Yükleme başarısız.");
                        setTimeout(() => setStatus(""), 2500);
                      }
                    }}
                  />
                </div>
              </Field>
            </div>
            <div className="cp-grid-2">
              <Field label="Telefon">
                <input className="cp-input" value={bio.phone || ""} onChange={(e) => setBio({ ...bio, phone: e.target.value })} onBlur={() => save(bio, "Kaydedildi.")} />
              </Field>
              <Field label="E-posta">
                <input className="cp-input" value={bio.email || ""} onChange={(e) => setBio({ ...bio, email: e.target.value })} onBlur={() => save(bio, "Kaydedildi.")} />
              </Field>
            </div>
            <div style={{ display: "flex", gap: 28, flexWrap: "wrap", marginTop: 4 }}>
              <label className="cp-switch">
                <input type="checkbox" checked={!!bio.showPhone} onChange={(e) => save({ ...bio, showPhone: e.target.checked }, "Kaydedildi.")} />
                <b />
                Telefonu göster
              </label>
              <label className="cp-switch">
                <input type="checkbox" checked={!!bio.showEmail} onChange={(e) => save({ ...bio, showEmail: e.target.checked }, "Kaydedildi.")} />
                <b />
                E-postayı göster
              </label>
            </div>
          </Card>

          <Card title="Sosyal Medya">
            <div className="cp-list">
              {SOCIAL_PLATFORMS.map((platform) => {
                const social = bio.socialLinks.find((s) => s.platform === platform) || { platform, url: "" };
                return (
                  <div key={platform} className="cp-row" style={{ flexDirection: "column", alignItems: "stretch" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <span className="cp-row-title" style={{ textTransform: "capitalize" }}>{platform}</span>
                      {social.clicks !== undefined && <span className="cp-chip">{social.clicks} tıklama</span>}
                    </div>
                    <input
                      className="cp-input"
                      placeholder="URL"
                      defaultValue={social.url}
                      onBlur={(e) => {
                        const socialLinks = bio.socialLinks.filter((s) => s.platform !== platform);
                        socialLinks.push({ ...social, url: e.target.value, live: platform === "youtube" });
                        save({ ...bio, socialLinks }, "Kaydedildi.");
                      }}
                    />
                    {platform !== "youtube" && (
                      <input
                        className="cp-input"
                        style={{ marginTop: 8 }}
                        placeholder="Takipçi sayısı (örn. 15.5K)"
                        defaultValue={social.followerCount || ""}
                        onBlur={(e) => {
                          const socialLinks = bio.socialLinks.map((s) =>
                            s.platform === platform ? { ...s, followerCount: e.target.value } : s
                          );
                          save({ ...bio, socialLinks }, "Kaydedildi.");
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          <Card title="Linkler" aside={<span className="cp-chip">{bio.links.length} link</span>}>
            <div className="cp-list" style={{ marginBottom: 16 }}>
              {bio.links.map((link, i) => (
                <div key={link.id} className="cp-row" style={{ alignItems: "center" }}>
                  <span
                    aria-hidden="true"
                    style={{
                      width: 12,
                      alignSelf: "stretch",
                      borderRadius: 6,
                      background: link.color || "#E5471B",
                      border: "1.5px solid var(--ink)",
                      flexShrink: 0,
                    }}
                  />
                  <div className="cp-row-main">
                    <div className="cp-row-title">{link.title}</div>
                    <div className="cp-row-sub">
                      {link.subtitle} {link.clicks !== undefined && `· ${link.clicks} tıklama`}
                    </div>
                  </div>
                  <div className="cp-row-tools">
                    <button onClick={() => moveLink(i, -1)} disabled={i === 0} className="cp-icon-btn" aria-label="Yukarı" title="Yukarı"><ArrowUp size={16} /></button>
                    <button onClick={() => moveLink(i, 1)} disabled={i === bio.links.length - 1} className="cp-icon-btn" aria-label="Aşağı" title="Aşağı"><ArrowDown size={16} /></button>
                    <button onClick={() => { setEditingLink(link); setShowLinkForm(true); }} className="cp-icon-btn" aria-label="Düzenle" title="Düzenle"><Pencil size={16} /></button>
                    <button onClick={() => deleteLink(link.id)} className="cp-icon-btn is-danger" aria-label="Sil" title="Sil"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>

            {!showLinkForm ? (
              <button
                onClick={() => { setEditingLink(null); setShowLinkForm(true); }}
                className="cp-btn cp-btn-ghost"
              >
                <Plus size={16} /> Yeni Link
              </button>
            ) : (
              <LinkForm
                initial={editingLink}
                onCancel={() => { setShowLinkForm(false); setEditingLink(null); }}
                onSave={upsertLink}
              />
            )}
          </Card>
        </div>

        <aside className="cp-phone-col" aria-label="Canlı önizleme">
          <div className="cp-phone">
            <iframe key={previewKey} src="/bio" title="Bio sayfası önizleme" />
          </div>
        </aside>
      </div>

      <Toast msg={status} bad={bad} />
    </div>
  );
}

function LinkForm({
  initial,
  onCancel,
  onSave,
}: {
  initial: BioLink | null;
  onCancel: () => void;
  onSave: (link: BioLink) => void;
}) {
  const [form, setForm] = useState<BioLink>(
    initial || { id: "", title: "", subtitle: "", url: "", icon: "globe", color: "#E5471B", iconColor: "#FFFFFF", perk: "" }
  );

  return (
    <div className="cp-row" style={{ flexDirection: "column", alignItems: "stretch", borderColor: "var(--ink)", background: "var(--paper)" }}>
      <div className="cp-grid-2">
        <Field label="Başlık">
          <input className="cp-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </Field>
        <Field label="Alt Başlık">
          <input className="cp-input" value={form.subtitle || ""} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
        </Field>
      </div>
      <Field label="URL">
        <input className="cp-input" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
      </Field>
      <div className="cp-grid-3">
        <Field label="İkon">
          <select className="cp-input" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}>
            {ICON_OPTIONS.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </Field>
        <Field label="Renk">
          <input type="color" value={form.color || "#E5471B"} onChange={(e) => setForm({ ...form, color: e.target.value })} className="cp-color" />
        </Field>
        <Field label="İkon Rengi">
          <input type="color" value={form.iconColor || "#FFFFFF"} onChange={(e) => setForm({ ...form, iconColor: e.target.value })} className="cp-color" />
        </Field>
      </div>
      {form.icon === "image" && (
        <Field label="İkon Görseli">
          <input
            type="file"
            accept="image/*"
            className="cp-file"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const url = await uploadImage(file);
              setForm({ ...form, iconImage: url });
            }}
          />
        </Field>
      )}
      <Field label="Rozet (opsiyonel)">
        <input className="cp-input" value={form.perk || ""} onChange={(e) => setForm({ ...form, perk: e.target.value })} />
      </Field>

      <div className="cp-actions">
        <button
          onClick={() => {
            const id = form.id || form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `link-${Date.now()}`;
            onSave({ ...form, id });
          }}
          className="cp-btn cp-btn-primary"
        >
          Kaydet
        </button>
        <button onClick={onCancel} className="cp-btn cp-btn-ghost">
          Vazgeç
        </button>
      </div>
    </div>
  );
}
