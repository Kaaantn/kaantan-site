// Thin wrapper around the GitHub Contents API. Ported verbatim from
// netlify/functions/lib/github.js. Blog posts stay as real markdown files
// in the repo (not a database) so static generation, sitemap.ts and
// SEO-friendly rendering keep working unchanged — saving from the panel
// just makes a normal commit, which Vercel then auto-deploys (~30-60s),
// same as if it had been pushed by hand.

const OWNER = "Kaaantn";
const REPO = "kaantan-site";
const BRANCH = "master";
const API_BASE = `https://api.github.com/repos/${OWNER}/${REPO}`;

function token(): string {
  const t = process.env.GH_CONTENT_TOKEN;
  if (!t) throw new Error("GH_CONTENT_TOKEN env var is not set");
  return t.trim();
}

interface GhResult<T = unknown> {
  ok: boolean;
  status: number;
  data: T;
}

async function ghFetch<T = unknown>(path: string, options?: RequestInit): Promise<GhResult<T>> {
  const opts = options || {};
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token()}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(opts.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export interface GhDirEntry {
  type: "file" | "dir";
  name: string;
}

export interface GhFile {
  content: string;
  sha: string;
}

export interface GhCommitResult {
  content: { sha: string };
  message?: string;
}

export function listDir(dirPath: string) {
  return ghFetch<GhDirEntry[]>(`/contents/${dirPath}?ref=${BRANCH}`);
}

export function getFile(filePath: string) {
  return ghFetch<GhFile>(`/contents/${filePath}?ref=${BRANCH}`);
}

export function putFile(filePath: string, content: string, message: string, sha?: string) {
  const body: { message: string; content: string; branch: string; sha?: string } = {
    message,
    content: Buffer.from(content, "utf8").toString("base64"),
    branch: BRANCH,
  };
  if (sha) body.sha = sha;
  return ghFetch<GhCommitResult>(`/contents/${filePath}`, { method: "PUT", body: JSON.stringify(body) });
}

export function deleteFile(filePath: string, message: string, sha: string) {
  return ghFetch(`/contents/${filePath}`, {
    method: "DELETE",
    body: JSON.stringify({ message, sha, branch: BRANCH }),
  });
}

export function decodeContent(base64: string): string {
  return Buffer.from(base64, "base64").toString("utf8");
}
