// Minimal frontmatter parser tailored to this project's own post format
// (simple `key: "value"` scalars, occasionally a `key: |` block like the
// FAQ post's schema field). Deliberately not a full YAML parser — it only
// needs to round-trip what our own files actually contain, and must never
// silently drop a field it doesn't recognize (e.g. that schema block) when
// re-saving a post through the panel.
//
// Ported verbatim from netlify/functions/lib/frontmatter.js (kept as the
// GitHub Contents API-backed blog panel's parser rather than switching to
// gray-matter, since this is proven against the real post files, including
// the FAQPage schema block round-trip).

export type FrontmatterBlock =
  | { key: string; type: "scalar"; value: string }
  | { key: string; type: "block"; raw: string };

export interface ParsedPost {
  title: string;
  date: string;
  description: string;
  blocks: FrontmatterBlock[];
  body: string;
}

function splitDocument(raw: string): { frontmatterRaw: string; body: string } {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { frontmatterRaw: "", body: raw };
  return { frontmatterRaw: m[1], body: m[2] };
}

function unquote(value: string): string {
  const v = value.trim();
  if (v.startsWith('"') && v.endsWith('"') && v.length >= 2) return v.slice(1, -1);
  return v;
}

function parseBlocks(frontmatterRaw: string): FrontmatterBlock[] {
  const lines = frontmatterRaw.split(/\r?\n/);
  const blocks: FrontmatterBlock[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*):\s?(.*)$/);
    if (!m) {
      i++;
      continue;
    }
    const key = m[1];
    const rest = m[2];
    if (rest === "|" || rest === "|-" || rest === ">") {
      const blockLines = [line];
      i++;
      while (i < lines.length && (lines[i] === "" || /^\s/.test(lines[i]))) {
        blockLines.push(lines[i]);
        i++;
      }
      blocks.push({ key, type: "block", raw: blockLines.join("\n") });
    } else {
      blocks.push({ key, type: "scalar", value: unquote(rest) });
      i++;
    }
  }
  return blocks;
}

// Returns { title, date, description, blocks, body } for editing/listing.
export function parsePost(raw: string): ParsedPost {
  const { frontmatterRaw, body } = splitDocument(raw);
  const blocks = parseBlocks(frontmatterRaw);
  const scalar = (key: string) => {
    const b = blocks.find((x) => x.key === key && x.type === "scalar");
    return b && b.type === "scalar" ? b.value : "";
  };
  return {
    title: scalar("title"),
    date: scalar("date"),
    description: scalar("description"),
    blocks,
    body: body.replace(/^\r?\n/, ""),
  };
}

function formatScalarLine(key: string, value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return `${key}: ${value}`;
  return `${key}: ${JSON.stringify(value)}`;
}

// Rebuilds a full .md file. `blocks` (from an existing parsePost, or [] for
// a brand new post) is used to preserve any field this editor doesn't know
// about (like the FAQ post's `schema: |` block) untouched.
export function buildPost({
  title,
  date,
  description,
  body,
  blocks,
}: {
  title: string;
  date: string;
  description: string;
  body: string;
  blocks: FrontmatterBlock[];
}): string {
  const known: Record<string, string> = { title, date, description };
  const outLines: string[] = [];
  const seen = new Set<string>();

  for (const b of blocks || []) {
    if (Object.prototype.hasOwnProperty.call(known, b.key)) {
      outLines.push(formatScalarLine(b.key, known[b.key]));
    } else if (b.type === "block") {
      outLines.push(b.raw);
    } else {
      // Unknown scalar field (e.g. Decap's optional `cover`) — preserve it
      // untouched rather than dropping it, same intent as the block-raw path.
      outLines.push(formatScalarLine(b.key, b.value));
    }
    seen.add(b.key);
  }
  for (const key of Object.keys(known)) {
    if (!seen.has(key)) outLines.push(formatScalarLine(key, known[key]));
  }

  const frontmatter = outLines.join("\n");
  const trimmedBody = (body || "").replace(/\s+$/, "");
  return `---\n${frontmatter}\n---\n\n${trimmedBody}\n`;
}

// Returns the dedented content of a `key: |` block scalar (e.g. the FAQ
// post's `schema` field), or null if that key isn't a block field. Mirrors
// what Eleventy exposed as the raw frontmatter string value at `schema`.
export function getBlockValue(blocks: FrontmatterBlock[], key: string): string | null {
  const b = blocks.find((x) => x.key === key && x.type === "block");
  if (!b || b.type !== "block") return null;
  const lines = b.raw.split(/\r?\n/).slice(1); // drop the "key: |" line itself
  const indents = lines.filter((l) => l.trim() !== "").map((l) => l.match(/^\s*/)?.[0].length ?? 0);
  const minIndent = indents.length ? Math.min(...indents) : 0;
  return lines.map((l) => l.slice(minIndent)).join("\n").replace(/\s+$/, "");
}

export function slugify(text: string): string {
  const map: Record<string, string> = {
    ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", I: "i", İ: "i",
    ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u",
  };
  const folded = String(text)
    .split("")
    .map((ch) => map[ch] || ch)
    .join("");
  return folded
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
