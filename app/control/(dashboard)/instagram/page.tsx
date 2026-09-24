"use client";

import { useEffect, useState } from "react";
import { Check, Pencil, Trash2, TriangleAlert } from "lucide-react";
import Toast from "../../Toast";

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

export default function InstagramAdminPage() {
  const [configs, setConfigs] = useState<Configs | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [fallbackWord, setFallbackWord] = useState("");
  const [status, setStatus] = useState("");
  const [bad, setBad] = useState(false);

  useEffect(() => {
    fetch("/api/control/instagram/configs").then((r) => r.json()).then((data: Configs) => {
      setConfigs(data);
      setFallbackWord(data.fallbackWord || "");
    });
    fetch("/api/control/instagram/stats").then((r) => r.json()).then(setStats);
  }, []);

  function flash(msg: string, isBad = false) {
    setBad(isBad);
    setStatus(msg);
    setTimeout(() => setStatus(""), 2600);
  }

  async function savePost() {
    if (!form.postLink.trim() || !form.link.trim()) {
      flash("Post linki ve gönderilecek link zorunlu.", true);
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
      flash("Kaydedilemedi.", true);
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
    else flash("Kaydedilemedi.", true);
  }

  async function saveFallback() {
    const res = await fetch("/api/control/instagram/configs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fallbackWord }),
    });
    flash(res.ok ? "Kaydedildi." : "Kaydedilemedi.", !res.ok);
  }

  if (!configs) return <p className="cp-empty">Yükleniyor…</p>;

  return (
    <div>
      <div className="cp-head">
        <div>
          <h1>Instagram Yorum Otomasyonu</h1>
          <p>Bir gönderiye belirlediğin kelimeyi yazan herkese otomatik DM ile link gider. Eşleşmeleri buradan yönet.</p>
        </div>
      </div>

      <Card title="Yorumlara Genel Yanıt">
        <div className="cp-switch-row">
          <span>Kapatırsan bot yorumun altına yanıt yazmaz; DM ve takip kontrolü aynen çalışmaya devam eder.</span>
          <label className="cp-switch">
            <input
              type="checkbox"
              checked={configs.publicReplyEnabled !== false}
              onChange={(e) => togglePublicReply(e.target.checked)}
              aria-label="Yorumlara genel yanıt"
            />
            <b />
          </label>
        </div>
      </Card>

      <Card title="Varsayılan (Fallback) Kelime">
        <p className="cp-hint">Post için ayrı kelime tanımlanmadıysa devreye girecek genel kelime.</p>
        <div style={{ display: "flex", gap: 8 }}>
          <input className="cp-input" placeholder="örn. LİNK" value={fallbackWord} onChange={(e) => setFallbackWord(e.target.value)} />
          <button onClick={saveFallback} className="cp-btn cp-btn-ghost">
            Kaydet
          </button>
        </div>
      </Card>

      <Card title={form.id ? "Postu Düzenle" : "Yeni Post Ekle"}>
        <div className="cp-field">
          <label className="cp-label">Post linki veya medya ID</label>
          <input className="cp-input" placeholder="https://instagram.com/p/... veya medya ID" value={form.postLink} onChange={(e) => setForm({ ...form, postLink: e.target.value })} />
        </div>
        <div className="cp-grid-2">
          <div className="cp-field">
            <label className="cp-label">Tetikleyici kelime(ler) — virgülle ayır</label>
            <input className="cp-input" placeholder="KOLSUZ, LİNK" value={form.triggerWords} onChange={(e) => setForm({ ...form, triggerWords: e.target.value })} />
          </div>
          <div className="cp-field">
            <label className="cp-label">Gönderilecek link</label>
            <input className="cp-input" placeholder="https://..." value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
          </div>
        </div>
        <div className="cp-field">
          <label className="cp-label">Özel mesaj metni (opsiyonel)</label>
          <textarea className="cp-input" rows={2} placeholder="Boş bırakırsan varsayılan metinler kullanılır" value={form.messageOverride} onChange={(e) => setForm({ ...form, messageOverride: e.target.value })} />
        </div>
        <label className="cp-switch" style={{ marginBottom: 6 }}>
          <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
          <b />
          Aktif
        </label>
        <div className="cp-actions" style={{ marginTop: 16 }}>
          <button onClick={savePost} className="cp-btn cp-btn-primary">
            Kaydet
          </button>
          {form.id && (
            <button onClick={() => setForm(emptyForm)} className="cp-btn cp-btn-ghost">
              Vazgeç
            </button>
          )}
        </div>
      </Card>

      <Card title="Kayıtlı Postlar" aside={<span className="cp-chip">{configs.posts.length} kayıt</span>}>
        {configs.posts.length === 0 ? (
          <p className="cp-empty">Henüz post eklenmedi.</p>
        ) : (
          <div className="cp-list">
            {configs.posts.map((p) => (
              <div key={p.id} className={`cp-row${p.active === false ? " is-off" : ""}`}>
                <div className="cp-row-main">
                  <div className="cp-row-title">{p.postLink || p.mediaId || "(link yok)"}</div>
                  <div className="cp-row-sub">
                    {p.active === false ? "Pasif" : "Aktif"} · Link: {p.link || "-"}
                  </div>
                  <div className="cp-chips" style={{ marginTop: 10 }}>
                    {(p.triggerWords.length ? p.triggerWords : ["varsayılan kelime"]).map((w) => (
                      <span key={w} className="cp-chip is-accent">
                        {w}
                      </span>
                    ))}
                    {p.mediaId ? (
                      <span className="cp-chip is-ok">
                        <Check size={12} /> posta özel eşleşiyor
                      </span>
                    ) : (
                      <span className="cp-chip is-warn">
                        <TriangleAlert size={12} /> medya ID yok — linki kontrol edip kaydet
                      </span>
                    )}
                  </div>
                </div>
                <div className="cp-row-tools">
                  <button onClick={() => startEdit(p)} className="cp-icon-btn" aria-label="Düzenle" title="Düzenle">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => deletePost(p.id)} className="cp-icon-btn is-danger" aria-label="Sil" title="Sil">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="İstatistikler">
        {!stats ? (
          <p className="cp-empty">Yükleniyor…</p>
        ) : (
          <>
            <div className="cp-stats">
              {[
                ["DM gönderildi", stats.totals.dmSent],
                ["DM atılamadı", stats.totals.dmFailed],
                ["Linki istedi", stats.totals.clickedGetLink],
                ["Yeni takipçi oldu", stats.totals.becameFollower],
                ["Son linke tıkladı", stats.totals.linkClicked],
              ].map(([label, value]) => (
                <div key={label as string} className="cp-stat">
                  <b>{value}</b>
                  <span>{label}</span>
                </div>
              ))}
            </div>

            {stats.rows.length > 0 && (
              <div className="cp-table-wrap">
                <table className="cp-table">
                  <thead>
                    <tr>
                      <th>Kullanıcı</th>
                      <th>DM</th>
                      <th>Linki istedi</th>
                      <th>Takipçi oldu</th>
                      <th>Linke tıkladı</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.rows.map((r, i) => (
                      <tr key={i}>
                        <td>{r.username || "(bilinmiyor)"}</td>
                        <td>
                          {r.dmFailed ? <span className="cp-chip is-muted">Atılamadı</span> : <span className="cp-chip is-ok">Gönderildi</span>}
                        </td>
                        <td>{r.clickedGetLink ? "✔" : "—"}</td>
                        <td>{r.becameFollower ? "✔" : "—"}</td>
                        <td>{r.linkClicked ? "✔" : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </Card>

      <Toast msg={status} bad={bad} />
    </div>
  );
}
