import fs from "node:fs";
import path from "node:path";
import { parsePost, getBlockValue } from "./frontmatter";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

export interface PostSummary {
  slug: string;
  title: string;
  date: string;
  description: string;
}

export interface PostDetail extends PostSummary {
  body: string;
  schema: string | null;
  cover: string | null;
}

function readSlugs(): string[] {
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

export function getAllPosts(): PostSummary[] {
  const posts = readSlugs().map((slug) => {
    const raw = fs.readFileSync(path.join(POSTS_DIR, `${slug}.md`), "utf8");
    const parsed = parsePost(raw);
    return { slug, title: parsed.title, date: parsed.date, description: parsed.description };
  });
  posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return posts;
}

export function getPostSlugs(): string[] {
  return readSlugs();
}

export function getPostBySlug(slug: string): PostDetail | null {
  const filePath = path.join(POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = parsePost(raw);
  const coverBlock = parsed.blocks.find((b) => b.key === "cover" && b.type === "scalar");
  return {
    slug,
    title: parsed.title,
    date: parsed.date,
    description: parsed.description,
    body: parsed.body,
    schema: getBlockValue(parsed.blocks, "schema"),
    cover: coverBlock && coverBlock.type === "scalar" ? coverBlock.value : null,
  };
}
