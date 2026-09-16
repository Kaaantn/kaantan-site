import * as github from "@/lib/github";
import { parsePost, buildPost, slugify } from "@/lib/frontmatter";

// Ported from netlify/functions/blog-admin.js. Posts now live at
// content/posts/ (blog/posts/ was Eleventy's input dir, retired with it).
export const POSTS_DIR = "content/posts";
export const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export interface PostSummary {
  slug: string;
  title: string;
  date: string;
  description: string;
  sha: string;
}

export interface PostDetail extends PostSummary {
  body: string;
}

export async function listPosts(): Promise<PostSummary[]> {
  const dir = await github.listDir(POSTS_DIR);
  if (!dir.ok) throw Object.assign(new Error("GitHub'dan okunamadı"), { statusCode: 502 });

  const files = (dir.data || []).filter((f) => f.type === "file" && f.name.endsWith(".md"));
  const posts = await Promise.all(
    files.map(async (f) => {
      const file = await github.getFile(`${POSTS_DIR}/${f.name}`);
      if (!file.ok) return null;
      const raw = github.decodeContent(file.data.content);
      const parsed = parsePost(raw);
      return {
        slug: f.name.replace(/\.md$/, ""),
        title: parsed.title,
        date: parsed.date,
        description: parsed.description,
        sha: file.data.sha,
      };
    })
  );

  const clean = posts.filter((p): p is PostSummary => p !== null);
  clean.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  return clean;
}

export async function getPost(slug: string): Promise<PostDetail> {
  const file = await github.getFile(`${POSTS_DIR}/${slug}.md`);
  if (!file.ok) throw Object.assign(new Error("Bulunamadı"), { statusCode: 404 });
  const raw = github.decodeContent(file.data.content);
  const parsed = parsePost(raw);
  return {
    slug,
    title: parsed.title,
    date: parsed.date,
    description: parsed.description,
    body: parsed.body,
    sha: file.data.sha,
  };
}

export interface SavePostInput {
  slug?: string;
  title: string;
  date: string;
  description: string;
  body: string;
  sha?: string;
}

export async function savePost(input: SavePostInput) {
  const title = input.title.trim();
  const date = input.date.trim();
  const description = (input.description || "").trim();
  const content = input.body.trim();
  let slug = (input.slug || "").trim();

  if (!title || !content) throw Object.assign(new Error("Başlık ve içerik zorunlu"), { statusCode: 400 });
  if (!DATE_RE.test(date)) throw Object.assign(new Error("Tarih YYYY-MM-DD formatında olmalı"), { statusCode: 400 });

  const isUpdate = Boolean(input.sha);

  if (!isUpdate) {
    slug = slugify(slug || title);
    if (!SLUG_RE.test(slug)) throw Object.assign(new Error("Geçersiz slug"), { statusCode: 400 });
  } else if (!SLUG_RE.test(slug)) {
    throw Object.assign(new Error("Geçersiz slug"), { statusCode: 400 });
  }

  const path = `${POSTS_DIR}/${slug}.md`;
  let blocks: ReturnType<typeof parsePost>["blocks"] = [];
  let sha = input.sha;

  if (isUpdate) {
    const existing = await github.getFile(path);
    if (!existing.ok) throw Object.assign(new Error("Bulunamadı"), { statusCode: 404 });
    const parsedExisting = parsePost(github.decodeContent(existing.data.content));
    blocks = parsedExisting.blocks;
    sha = existing.data.sha;
  }

  const fileContent = buildPost({ title, date, description, body: content, blocks });
  const message = isUpdate ? `Blog: "${title}" güncellendi` : `Blog: "${title}" eklendi`;
  const result = await github.putFile(path, fileContent, message, sha);

  if (!result.ok) {
    const msg = (result.data as { message?: string })?.message || "Kaydedilemedi";
    throw Object.assign(new Error(msg), { statusCode: 409 });
  }

  return { slug, title, date, description, sha: result.data.content.sha };
}

export async function deletePost(slug: string, sha: string) {
  if (!SLUG_RE.test(slug)) throw Object.assign(new Error("Geçersiz slug"), { statusCode: 400 });
  const result = await github.deleteFile(`${POSTS_DIR}/${slug}.md`, `Blog: "${slug}" silindi`, sha);
  if (!result.ok) {
    const msg = (result.data as { message?: string })?.message || "Silinemedi";
    throw Object.assign(new Error(msg), { statusCode: 409 });
  }
}
