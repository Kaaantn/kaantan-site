"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { marked } from "marked";
import { ArrowUpRight, Pencil, Trash2 } from "lucide-react";
import Toast from "../../Toast";

interface PostSummary {
  slug: string;
  title: string;
  date: string;
  description: string;
  sha: string;
}

const emptyForm = { slug: "", sha: "", title: "", date: new Date().toISOString().slice(0, 10), description: "", body: "" };

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<PostSummary[] | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [status, setStatus] = useState<{ text: string; ok: boolean } | null>(null);
  const [q, setQ] = useState("");

  function loadPosts() {
    fetch("/api/control/blog/posts")
      .then((r) => r.json())
      .then((data) => setPosts(data.posts || []))
      .catch(() => setPosts([]));
  }

  useEffect(loadPosts, []);

  useEffect(() => {
    if (!status || status.text.startsWith("Yükleniyor") || status.text.startsWith("Kaydediliyor")) return;
    const t = setTimeout(() => setStatus(null), 3800);
    return () => clearTimeout(t);
  }, [status]);

  async function startEdit(slug: string) {
    setStatus({ text: "Yükleniyor…", ok: true });
    const res = await fetch(`/api/control/blog/posts/${encodeURIComponent(slug)}`);
    if (!res.ok) {
      setStatus({ text: "Yüklenemedi.", ok: false });
      return;
    }
    const post = await res.json();
    setForm({ slug: post.slug, sha: post.sha, title: post.title || "", date: post.date || "", description: post.description || "", body: post.body || "" });
    setStatus(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setForm({ ...emptyForm, date: new Date().toISOString().slice(0, 10) });
    setTab("write");
  }

  async function deletePost(slug: string, sha: string) {
    if (!confirm(`"${slug}" yazısı silinsin mi? Bu işlem geri alınamaz.`)) return;
    const res = await fetch(`/api/control/blog/posts/${encodeURIComponent(slug)}?sha=${encodeURIComponent(sha)}`, { method: "DELETE" });
    if (res.ok) {
      setPosts((p) => (p || []).filter((x) => x.slug !== slug));
      if (form.slug === slug) resetForm();
    } else {
      alert("Silinemedi.");
    }
  }

  async function save() {
    const title = form.title.trim();
    const date = form.date.trim();
    const body = form.body.trim();
    if (!title || !date || !body) {
      setStatus({ text: "Başlık, tarih ve içerik zorunlu.", ok: false });
      return;
    }

    setStatus({ text: "Kaydediliyor…", ok: true });
    const isUpdate = Boolean(form.sha);
    const url = isUpdate ? `/api/control/blog/posts/${encodeURIComponent(form.slug)}` : "/api/control/blog/posts";
    const res = await fetch(url, {
      method: isUpdate ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: form.slug, sha: form.sha || undefined, title, date, description: form.description.trim(), body }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setStatus({ text: err.error || "Kaydedilemedi.", ok: false });
      return;
    }

    setStatus({ text: "Kaydedildi — ~30-60 saniye içinde canlıya çıkacak.", ok: true });
    resetForm();
    loadPosts();
  }

  const previewHtml = tab === "preview" ? (marked.parse(form.body || "", { async: false }) as string) : "";
  const words = useMemo(() => (form.body.trim() ? form.body.trim().split(/\s+/).length : 0), [form.body]);

  const filtered = useMemo(() => {
    const t = q.trim().toLocaleLowerCase("tr");
    if (!posts) return null;
    if (!t) return posts;
    return posts.filter((p) => `${p.title} ${p.description}`.toLocaleLowerCase("tr").includes(t));
  }, [posts, q]);

  return (
    <div>
      <div className="cp-head">
        <div>
          <h1>Blog Yazıları</h1>
          <p>Kaydettiğinde GitHub&apos;a commit atılır, ~30-60 saniye içinde otomatik yayına alınır.</p>
        </div>
        <div className="cp-head-actions">
          <Link href="/blog" target="_blank" className="cp-btn cp-btn-ghost">
            Bloğu gör <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>

      <section className="cp-card">
        <div className="cp-card-head">
          <h2>{form.sha ? "Yazıyı Düzenle" : "Yeni Yazı Ekle"}</h2>
          {form.sha && <span className="cp-chip is-accent">düzenleniyor</span>}
        </div>

        <div className="cp-field">
          <label className="cp-label">Başlık</label>
          <input className="cp-input" placeholder="Yazının başlığı" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="cp-grid-2">
          <div className="cp-field">
            <label className="cp-label">Yayın tarihi</label>
            <input type="date" className="cp-input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="cp-field">
            <label className="cp-label">Açıklama (SEO / önizleme)</label>
            <textarea className="cp-input" rows={2} placeholder="Google'da ve blog listesinde görünecek kısa açıklama" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="cp-hint" style={{ margin: "6px 0 0" }}>{form.description.length} karakter · ideal 120-160</div>
          </div>
        </div>

        <div className="cp-tabs" role="tablist">
          <button role="tab" aria-selected={tab === "write"} className={tab === "write" ? "is-on" : ""} onClick={() => setTab("write")}>
            Yaz
          </button>
          <button role="tab" aria-selected={tab === "preview"} className={tab === "preview" ? "is-on" : ""} onClick={() => setTab("preview")}>
            Önizle
          </button>
        </div>

        {tab === "write" ? (
          <div className="cp-field">
            <label className="cp-label">İçerik — Markdown (## başlık, **kalın**, [link](url))</label>
            <textarea
              className="cp-input cp-mono"
              style={{ minHeight: 340 }}
              placeholder="Yazının içeriği..."
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
            />
            <div className="cp-hint" style={{ margin: "6px 0 0" }}>{words} kelime · yaklaşık {Math.max(1, Math.round(words / 200))} dk okuma</div>
          </div>
        ) : (
          <div className="cp-preview" dangerouslySetInnerHTML={{ __html: previewHtml }} />
        )}

        <div className="cp-actions" style={{ marginTop: 16 }}>
          <button onClick={save} className="cp-btn cp-btn-primary">
            Kaydet
          </button>
          {form.sha && (
            <button onClick={resetForm} className="cp-btn cp-btn-ghost">
              Vazgeç
            </button>
          )}
        </div>
      </section>

      <section className="cp-card">
        <div className="cp-card-head">
          <h2>Yayındaki Yazılar</h2>
          {posts && <span className="cp-chip">{posts.length} yazı</span>}
        </div>

        <div className="cp-field">
          <input className="cp-input" placeholder="Yazılarda ara…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Yazılarda ara" />
        </div>

        {filtered === null ? (
          <p className="cp-empty">Yükleniyor…</p>
        ) : filtered.length === 0 ? (
          <p className="cp-empty">{q ? "Eşleşen yazı yok." : "Henüz yazı yok."}</p>
        ) : (
          <div className="cp-list">
            {filtered.map((p) => (
              <div key={p.slug} className="cp-row">
                <div className="cp-row-main">
                  <div className="cp-row-title">{p.title}</div>
                  <div className="cp-row-sub">{p.date}</div>
                  <div className="cp-row-sub" style={{ marginTop: 6, color: "var(--ink-2)" }}>{p.description}</div>
                </div>
                <div className="cp-row-tools">
                  <Link href={`/blog/${p.slug}`} target="_blank" className="cp-icon-btn" aria-label="Yazıyı gör" title="Yazıyı gör">
                    <ArrowUpRight size={16} />
                  </Link>
                  <button onClick={() => startEdit(p.slug)} className="cp-icon-btn" aria-label="Düzenle" title="Düzenle">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => deletePost(p.slug, p.sha)} className="cp-icon-btn is-danger" aria-label="Sil" title="Sil">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Toast msg={status?.text || ""} bad={status ? !status.ok : false} />
    </div>
  );
}
