"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

interface Post {
  id: string;
  mediaId: string | null;
  postLink: string;
  triggerWords: string[];
  link: string;
  messageOverride: string;
  active: boolean;
}

interface Configs {
  fallbackWord: string;
  publicReplyEnabled: boolean;
  posts: Post[];
}

interface StatsData {
  totals: { dmSent: number; dmFailed: number; clickedGetLink: number; becameFollower: number; linkClicked: number };
  rows: {
    username: string | null;
    dmFailed: boolean;
    clickedGetLink: boolean;
    becameFollower: boolean;
    linkClicked: boolean;
  }[];
}

const emptyForm = { id: "", postLink: "", triggerWords: "", link: "", messageOverride: "", active: true };

const inputCls =
  "w-full rounded-lg border border-white/10 bg-[#16131e] px-3 py-2 text-sm text-[#f5f3f8] outline-none focus:border-[#8b5cf6]";
const labelCls = "mb-1.5 mt-3 block text-xs font-medium uppercase tracking-wide text-[#8a8494] first:mt-0";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5 rounded-xl border border-white/10 bg-[#0b0a10] p-6">
      <h2 className="mb-3 font-semibold text-[#f5f3f8]">{title}</h2>
      {children}
    </div>
  );
}

export default function InstagramAdminPage() {
  const [configs, setConfigs] = useState<Configs | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [fallbackWord, setFallbackWord] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch("/api/control/instagram/configs").then((r) => r.json()).then((data: Configs) => {
      setConfigs(data);
      setFallbackWord(data.fallbackWord || "");
    });
    fetch("/api/control/instagram/stats").then((r) => r.json()).then(setStats);
  }, []);

  function flash(msg: string) {
    setStatus(msg);
    setTimeout(() => setStatus(""), 2500);
  }

  async function savePost() {
    if (!form.postLink.trim() || !form.link.trim()) {
      flash("Post linki ve gönderilecek link zorunlu.");
      return;
    }
    const post = {
      id: form.id || undefined,
      postLink: form.postLink.trim(),
      triggerWords: form.triggerWords.split(",").map((s) => s.trim()).filter(Boolean),
      link: form.link.trim(),
      messageOverride: form.messageOverride.trim(),
      active: form.active,
    };
    const res = await fetch("/api/control/instagram/configs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post }),
    });
    if (res.ok) {
      setConfigs(await res.json());
      setForm(emptyForm);
      flash("Kaydedildi.");
    } else {
      flash("Kaydedilemedi.");
    }
  }

  function startEdit(p: Post) {
    setForm({
      id: p.id,
      postLink: p.postLink || p.mediaId || "",
      triggerWords: (p.triggerWords || []).join(", "),
      link: p.link || "",
      messageOverride: p.messageOverride || "",
      active: p.active !== false,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deletePost(id: string) {
    if (!confirm("Bu post silinsin mi?")) return;
    const res = await fetch(`/api/control/instagram/configs?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (res.ok) setConfigs(await res.json());
  }

  async function togglePublicReply(checked: boolean) {
    setConfigs((c) => (c ? { ...c, publicReplyEnabled: checked } : c));
    const res = await fetch("/api/control/instagram/configs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicReplyEnabled: checked }),
    });
    if (res.ok) flash(checked ? "Açık — kaydedildi." : "Kapalı — kaydedildi.");
    else flash("Kaydedilemedi.");
  }

  async function saveFallback() {
    const res = await fetch("/api/control/instagram/configs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fallbackWord }),
    });
    flash(res.ok ? "Kaydedildi." : "Kaydedilemedi.");
  }

  if (!configs) return <p className="text-[#8a8494]">Yükleniyor…</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#f5f3f8]">Instagram Yorum Otomasyonu</h1>
      <p className="mt-1 text-sm text-[#8a8494]">
        Post/kelime/link eşleşmelerini buradan yönet. {status && <span className="text-[#c9bbfc]">{status}</span>}
      </p>

      <div className="mt-6">
        <Card title="Yorumlara Genel Yanıt">
          <label className="flex items-center justify-between gap-4">
            <span className="text-sm text-[#dad6e3]">
              Kapatırsan bot yorumun altına yanıt yazmaz; DM ve takip kontrolü aynen çalışmaya devam eder.
            </span>
            <input
              type="checkbox"
              checked={configs.publicReplyEnabled !== false}
              onChange={(e) => togglePublicReply(e.target.checked)}
              className="h-5 w-9 shrink-0 accent-[#8b5cf6]"
            />
          </label>
        </Card>

        <Card title="Varsayılan (Fallback) Kelime">
          <p className="mb-2 text-xs text-[#8a8494]">Post için ayrı kelime tanımlanmadıysa devreye girecek genel kelime</p>
          <div className="flex gap-2">
            <input className={inputCls} placeholder="örn. LİNK" value={fallbackWord} onChange={(e) => setFallbackWord(e.target.value)} />
            <button onClick={saveFallback} className="shrink-0 rounded-lg border border-white/10 px-4 py-2 text-sm text-[#dad6e3] hover:bg-white/5">
              Kaydet
            </button>
          </div>
        </Card>

        <Card title={form.id ? "Postu Düzenle" : "Yeni Post Ekle"}>
          <label className={labelCls}>Post linki veya medya ID</label>
          <input className={inputCls} placeholder="https://instagram.com/p/... veya medya ID" value={form.postLink} onChange={(e) => setForm({ ...form, postLink: e.target.value })} />
          <label className={labelCls}>Tetikleyici kelime(ler) — virgülle ayır</label>
          <input className={inputCls} placeholder="KOLSUZ, LİNK" value={form.triggerWords} onChange={(e) => setForm({ ...form, triggerWords: e.target.value })} />
          <label className={labelCls}>Gönderilecek link</label>
          <input className={inputCls} placeholder="https://..." value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
          <label className={labelCls}>Özel mesaj metni (opsiyonel)</label>
          <textarea className={inputCls} rows={2} placeholder="Boş bırakırsan varsayılan metinler kullanılır" value={form.messageOverride} onChange={(e) => setForm({ ...form, messageOverride: e.target.value })} />
          <label className="mt-3 flex items-center gap-2 text-sm text-[#dad6e3]">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            Aktif
          </label>
          <div className="mt-4 flex gap-2">
            <button onClick={savePost} className="rounded-lg bg-[#a78bfa] px-4 py-2 text-sm font-semibold text-[#0b0a10] hover:bg-[#c4b5fd]">
              Kaydet
            </button>
            {form.id && (
              <button onClick={() => setForm(emptyForm)} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-[#dad6e3] hover:bg-white/5">
                Vazgeç
              </button>
            )}
          </div>
        </Card>

        <Card title="Kayıtlı Postlar">
          {configs.posts.length === 0 ? (
            <p className="py-4 text-center text-sm text-[#8a8494]">Henüz post eklenmedi.</p>
          ) : (
            <div className="space-y-3">
              {configs.posts.map((p) => (
                <div key={p.id} className={`rounded-lg border border-white/10 p-4 ${p.active === false ? "opacity-50" : ""}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-[#f5f3f8]">{p.postLink || p.mediaId || "(link yok)"}</div>
                      <div className="mt-0.5 text-xs text-[#8a8494]">
                        {p.active === false ? "Pasif" : "Aktif"} · Link: {p.link || "-"}
                      </div>
                      <div className="mt-0.5 text-xs text-[#8a8494]">
                        {p.mediaId ? "✔ Bu posta özel eşleşiyor (medya ID doğrulandı)" : "⚠️ Medya ID bulunamadı — post linkini kontrol edip tekrar kaydet."}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <button onClick={() => startEdit(p)} className="rounded p-1.5 text-[#8a8494] hover:bg-white/5"><Pencil size={15} /></button>
                      <button onClick={() => deletePost(p.id)} className="rounded p-1.5 text-red-400 hover:bg-white/5"><Trash2 size={15} /></button>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(p.triggerWords.length ? p.triggerWords : ["varsayılan kelime"]).map((w) => (
                      <span key={w} className="rounded-full border border-[#8b5cf6]/30 bg-[#8b5cf6]/15 px-2.5 py-0.5 text-xs font-medium text-[#ded2fe]">
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="İstatistikler">
          {!stats ? (
            <p className="text-sm text-[#8a8494]">Yükleniyor…</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {[
                  ["DM gönderildi", stats.totals.dmSent],
                  ["DM atılamadı", stats.totals.dmFailed],
                  ["Linki istedi", stats.totals.clickedGetLink],
                  ["Yeni takipçi oldu", stats.totals.becameFollower],
                  ["Son linke tıkladı", stats.totals.linkClicked],
                ].map(([label, value]) => (
                  <div key={label as string} className="rounded-lg border border-white/10 bg-[#16131e] p-3">
                    <div className="font-mono text-lg text-[#f5f3f8]">{value}</div>
                    <div className="text-[11px] text-[#8a8494]">{label}</div>
                  </div>
                ))}
              </div>

              {stats.rows.length > 0 && (
                <table className="mt-4 w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs uppercase text-[#8a8494]">
                      <th className="py-2">Kullanıcı</th>
                      <th className="py-2">DM</th>
                      <th className="py-2">Linki istedi</th>
                      <th className="py-2">Takipçi oldu</th>
                      <th className="py-2">Linke tıkladı</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.rows.map((r, i) => (
                      <tr key={i} className="border-b border-white/5 text-[#dad6e3]">
                        <td className="py-1.5">{r.username || "(bilinmiyor)"}</td>
                        <td className="py-1.5">{r.dmFailed ? <span className="text-[#8a8494]">Atılamadı</span> : <span className="text-[#a78bfa]">Gönderildi</span>}</td>
                        <td className="py-1.5">{r.clickedGetLink ? "✔" : "—"}</td>
                        <td className="py-1.5">{r.becameFollower ? "✔" : "—"}</td>
                        <td className="py-1.5">{r.linkClicked ? "✔" : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
