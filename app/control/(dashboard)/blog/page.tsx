"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { marked } from "marked";

interface PostSummary {
  slug: string;
  title: string;
  date: string;
  description: string;
  sha: string;
}

const emptyForm = { slug: "", sha: "", title: "", date: new Date().toISOString().slice(0, 10), description: "", body: "" };

const inputCls =
  "w-full rounded-lg border border-white/10 bg-[#16131e] px-3 py-2 text-sm text-[#f5f3f8] outline-none focus:border-[#8b5cf6]";
const labelCls = "mb-1.5 mt-3 block text-xs font-medium uppercase tracking-wide text-[#8a8494] first:mt-0";

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<PostSummary[] | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [status, setStatus] = useState<{ text: string; ok: boolean } | null>(null);

  function loadPosts() {
    fetch("/api/control/blog/posts")
      .then((r) => r.json())
      .then((data) => setPosts(data.posts || []))
      .catch(() => setPosts([]));
  }

  useEffect(loadPosts, []);

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
    setStatus(null);
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

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#f5f3f8]">Blog Yazıları</h1>
      <p className="mt-1 text-sm text-[#8a8494]">
        Kaydettiğinde GitHub&apos;a commit atılır, ~30-60 saniye içinde otomatik yayına alır.{" "}
        <Link href="/blog/" target="_blank" className="font-semibold text-[#a78bfa]">Bloğu gör →</Link>
      </p>

      <div className="mt-6 rounded-xl border border-white/10 bg-[#0b0a10] p-6">
        <h2 className="mb-3 font-semibold text-[#f5f3f8]">{form.sha ? "Yazıyı Düzenle" : "Yeni Yazı Ekle"}</h2>

        <label className={labelCls}>Başlık</label>
        <input className={inputCls} placeholder="Yazının başlığı" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />

        <label className={labelCls}>Yayın tarihi</label>
        <input type="date" className={inputCls} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />

        <label className={labelCls}>Açıklama (SEO / önizleme için)</label>
        <textarea className={inputCls} rows={2} placeholder="Google'da ve blog listesinde görünecek kısa açıklama" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

        <div className="mt-4 flex gap-1 border-b border-white/10">
          <button onClick={() => setTab("write")} className={`px-3.5 py-2 text-sm font-medium ${tab === "write" ? "border-b-2 border-[#8b5cf6] text-[#f5f3f8]" : "text-[#8a8494]"}`}>Yaz</button>
          <button onClick={() => setTab("preview")} className={`px-3.5 py-2 text-sm font-medium ${tab === "preview" ? "border-b-2 border-[#8b5cf6] text-[#f5f3f8]" : "text-[#8a8494]"}`}>Önizle</button>
        </div>

        {tab === "write" ? (
          <>
            <label className={labelCls}>İçerik (Markdown — ## başlık, **kalın**, [link](url) gibi)</label>
            <textarea
              className={`${inputCls} min-h-[320px] font-mono text-[0.86rem] leading-relaxed`}
              placeholder="Yazının içeriği..."
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
            />
          </>
        ) : (
          <div
            className="prose prose-invert mt-3 min-h-[320px] rounded-lg border border-white/10 bg-[#16131e] p-4 text-sm text-[#dad6e3] [&_a]:text-[#a78bfa] [&_h2]:mt-5 [&_h2]:text-[#f5f3f8] [&_p]:mb-3"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        )}

        <div className="mt-4 flex gap-2">
          <button onClick={save} className="rounded-lg bg-[#a78bfa] px-4 py-2 text-sm font-semibold text-[#0b0a10] hover:bg-[#c4b5fd]">
            Kaydet
          </button>
          {form.sha && (
            <button onClick={resetForm} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-[#dad6e3] hover:bg-white/5">
              Vazgeç
            </button>
          )}
        </div>
        {status && <p className={`mt-2.5 text-sm ${status.ok ? "text-[#a78bfa]" : "text-red-400"}`}>{status.text}</p>}
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-[#0b0a10] p-6">
        <h2 className="mb-3 font-semibold text-[#f5f3f8]">Yayındaki Yazılar</h2>
        {posts === null ? (
          <p className="text-sm text-[#8a8494]">Yükleniyor…</p>
        ) : posts.length === 0 ? (
          <p className="py-4 text-center text-sm text-[#8a8494]">Henüz yazı yok.</p>
        ) : (
          <div className="space-y-3">
            {posts.map((p) => (
              <div key={p.slug} className="rounded-lg border border-white/10 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-[#f5f3f8]">{p.title}</div>
                    <div className="mt-0.5 text-xs text-[#8a8494]">{p.date}</div>
                    <div className="mt-1.5 text-sm text-[#b7b2c4]">{p.description}</div>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-1.5">
                    <Link href={`/blog/${p.slug}/`} target="_blank" className="rounded border border-white/10 px-2.5 py-1 text-xs text-[#8a8494] hover:text-[#f5f3f8]">
                      Gör
                    </Link>
                    <button onClick={() => startEdit(p.slug)} className="rounded border border-white/10 px-2.5 py-1 text-xs text-[#8a8494] hover:text-[#f5f3f8]">
                      Düzenle
                    </button>
                    <button onClick={() => deletePost(p.slug, p.sha)} className="rounded border border-white/10 px-2.5 py-1 text-xs text-[#8a8494] hover:text-[#f5f3f8]">
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
