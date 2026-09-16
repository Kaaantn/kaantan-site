"use client";

import { useEffect, useState } from "react";
import { ArrowUp, ArrowDown, Pencil, Trash2, Plus } from "lucide-react";
import type { BioConfig, BioLink } from "@/lib/bio";

const ICON_OPTIONS = [
  "image", "mic", "search", "star", "shopping-bag", "globe",
  "message-circle", "activity", "terminal", "file-text", "kt-logo",
];

const SOCIAL_PLATFORMS = ["youtube", "tiktok", "instagram"] as const;

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 rounded-xl border border-white/10 bg-[#0b0a10] p-6">
      <h2 className="mb-4 font-semibold text-[#f5f3f8]">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="mb-1.5 block text-xs font-medium text-[#dad6e3]">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-white/10 bg-[#16131e] px-3 py-2 text-sm text-[#f5f3f8] outline-none focus:border-[#8b5cf6]";

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
  const [editingLink, setEditingLink] = useState<BioLink | null>(null);
  const [showLinkForm, setShowLinkForm] = useState(false);

  useEffect(() => {
    fetch("/api/public/bio-config")
      .then((r) => r.json())
      .then(setBio)
      .catch(() => setStatus("Yüklenemedi."));
  }, []);

  async function save(next: BioConfig, msg: string) {
    setBio(next);
    const res = await fetch("/api/public/bio-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config: next }),
    });
    setStatus(res.ok ? msg : "Kaydedilemedi.");
    setTimeout(() => setStatus(""), 2500);
  }

  if (!bio) return <p className="text-[#8a8494]">Yükleniyor…</p>;

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
      <h1 className="text-2xl font-semibold text-[#f5f3f8]">Bio Sayfası</h1>
      <p className="mt-1 text-sm text-[#8a8494]">
        kaantan.com.tr/bio — {status && <span className="text-[#c9bbfc]">{status}</span>}
      </p>

      <div className="mt-6">
        <Card title="Profil">
          <Field label="Görünen Ad">
            <input className={inputCls} value={bio.displayName || ""} onChange={(e) => setBio({ ...bio, displayName: e.target.value })} onBlur={() => save(bio, "Kaydedildi.")} />
          </Field>
          <Field label="Bio">
            <textarea className={inputCls} rows={2} value={bio.bio || ""} onChange={(e) => setBio({ ...bio, bio: e.target.value })} onBlur={() => save(bio, "Kaydedildi.")} />
          </Field>
          <Field label="Konum">
            <input className={inputCls} value={bio.location || ""} onChange={(e) => setBio({ ...bio, location: e.target.value })} onBlur={() => save(bio, "Kaydedildi.")} />
          </Field>
          <Field label="Banner Rengi">
            <div className="flex items-center gap-2">
              <input type="color" value={bio.bannerColor || "#4F46E5"} onChange={(e) => save({ ...bio, bannerColor: e.target.value }, "Kaydedildi.")} className="h-9 w-14 rounded border border-white/10 bg-transparent" />
              <input className={inputCls} value={bio.bannerColor || ""} onChange={(e) => setBio({ ...bio, bannerColor: e.target.value })} onBlur={() => save(bio, "Kaydedildi.")} />
            </div>
          </Field>
          <Field label="Profil Fotoğrafı">
            <div className="flex items-center gap-3">
              {bio.avatar && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={bio.avatar} alt="" className="h-12 w-12 rounded-full object-cover" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const url = await uploadImage(file);
                  save({ ...bio, avatar: url }, "Fotoğraf güncellendi.");
                }}
                className="text-sm text-[#8a8494]"
              />
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Telefon">
              <input className={inputCls} value={bio.phone || ""} onChange={(e) => setBio({ ...bio, phone: e.target.value })} onBlur={() => save(bio, "Kaydedildi.")} />
            </Field>
            <Field label="E-posta">
              <input className={inputCls} value={bio.email || ""} onChange={(e) => setBio({ ...bio, email: e.target.value })} onBlur={() => save(bio, "Kaydedildi.")} />
            </Field>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-[#dad6e3]">
              <input type="checkbox" checked={!!bio.showPhone} onChange={(e) => save({ ...bio, showPhone: e.target.checked }, "Kaydedildi.")} />
              Telefonu göster
            </label>
            <label className="flex items-center gap-2 text-sm text-[#dad6e3]">
              <input type="checkbox" checked={!!bio.showEmail} onChange={(e) => save({ ...bio, showEmail: e.target.checked }, "Kaydedildi.")} />
              E-postayı göster
            </label>
          </div>
        </Card>

        <Card title="Sosyal Medya">
          {SOCIAL_PLATFORMS.map((platform) => {
            const social = bio.socialLinks.find((s) => s.platform === platform) || { platform, url: "" };
            return (
              <div key={platform} className="mb-3 rounded-lg border border-white/10 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold capitalize text-[#f5f3f8]">{platform}</span>
                  {social.clicks !== undefined && <span className="text-xs text-[#8a8494]">{social.clicks} tıklama</span>}
                </div>
                <input
                  className={inputCls}
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
                    className={`${inputCls} mt-2`}
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
        </Card>

        <Card title="Linkler">
          <div className="mb-4 space-y-2">
            {bio.links.map((link, i) => (
              <div key={link.id} className="flex items-center gap-3 rounded-lg border border-white/10 p-3">
                <div className="flex-1">
                  <div className="text-sm font-medium text-[#f5f3f8]">{link.title}</div>
                  <div className="text-xs text-[#8a8494]">{link.subtitle} {link.clicks !== undefined && `· ${link.clicks} tıklama`}</div>
                </div>
                <button onClick={() => moveLink(i, -1)} className="rounded p-1.5 text-[#8a8494] hover:bg-white/5" title="Yukarı"><ArrowUp size={15} /></button>
                <button onClick={() => moveLink(i, 1)} className="rounded p-1.5 text-[#8a8494] hover:bg-white/5" title="Aşağı"><ArrowDown size={15} /></button>
                <button onClick={() => { setEditingLink(link); setShowLinkForm(true); }} className="rounded p-1.5 text-[#8a8494] hover:bg-white/5" title="Düzenle"><Pencil size={15} /></button>
                <button onClick={() => deleteLink(link.id)} className="rounded p-1.5 text-red-400 hover:bg-white/5" title="Sil"><Trash2 size={15} /></button>
              </div>
            ))}
          </div>

          {!showLinkForm ? (
            <button
              onClick={() => { setEditingLink(null); setShowLinkForm(true); }}
              className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-[#dad6e3] hover:bg-white/5"
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
    initial || { id: "", title: "", subtitle: "", url: "", icon: "globe", color: "#4F46E5", iconColor: "#FFFFFF", perk: "" }
  );

  return (
    <div className="rounded-lg border border-[#8b5cf6]/40 bg-[#16131e] p-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Başlık">
          <input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </Field>
        <Field label="Alt Başlık">
          <input className={inputCls} value={form.subtitle || ""} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
        </Field>
      </div>
      <Field label="URL">
        <input className={inputCls} value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
      </Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="İkon">
          <select className={inputCls} value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}>
            {ICON_OPTIONS.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </Field>
        <Field label="Renk">
          <input type="color" value={form.color || "#4F46E5"} onChange={(e) => setForm({ ...form, color: e.target.value })} className="h-9 w-full rounded border border-white/10 bg-transparent" />
        </Field>
        <Field label="İkon Rengi">
          <input type="color" value={form.iconColor || "#FFFFFF"} onChange={(e) => setForm({ ...form, iconColor: e.target.value })} className="h-9 w-full rounded border border-white/10 bg-transparent" />
        </Field>
      </div>
      {form.icon === "image" && (
        <Field label="İkon Görseli">
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const url = await uploadImage(file);
              setForm({ ...form, iconImage: url });
            }}
            className="text-sm text-[#8a8494]"
          />
        </Field>
      )}
      <Field label="Rozet (opsiyonel)">
        <input className={inputCls} value={form.perk || ""} onChange={(e) => setForm({ ...form, perk: e.target.value })} />
      </Field>

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => {
            const id = form.id || form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `link-${Date.now()}`;
            onSave({ ...form, id });
          }}
          className="rounded-lg bg-[#a78bfa] px-4 py-2 text-sm font-semibold text-[#0b0a10] hover:bg-[#c4b5fd]"
        >
          Kaydet
        </button>
        <button onClick={onCancel} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-[#dad6e3] hover:bg-white/5">
          Vazgeç
        </button>
      </div>
    </div>
  );
}
