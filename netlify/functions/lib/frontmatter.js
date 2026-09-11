// Minimal frontmatter parser tailored to this project's own post format
// (simple `key: "value"` scalars, occasionally a `key: |` block like the
// FAQ post's schema field). Deliberately not a full YAML parser — it only
// needs to round-trip what our own files actually contain, and must never
// silently drop a field it doesn't recognize (e.g. that schema block) when
// re-saving a post through the panel.

function splitDocument(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { frontmatterRaw: "", body: raw };
  return { frontmatterRaw: m[1], body: m[2] };
}

function unquote(value) {
  const v = value.trim();
  if (v.startsWith('"') && v.endsWith('"') && v.length >= 2) return v.slice(1, -1);
  return v;
}

function parseBlocks(frontmatterRaw) {
  const lines = frontmatterRaw.split(/\r?\n/);
  const blocks = [];
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
function parsePost(raw) {
  const { frontmatterRaw, body } = splitDocument(raw);
  const blocks = parseBlocks(frontmatterRaw);
  const scalar = (key) => {
    const b = blocks.find((x) => x.key === key && x.type === "scalar");
    return b ? b.value : "";
  };
  return {
    title: scalar("title"),
    date: scalar("date"),
    description: scalar("description"),
    blocks,
    body: body.replace(/^\r?\n/, ""),
  };
}

function formatScalarLine(key, value) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return `${key}: ${value}`;
  return `${key}: ${JSON.stringify(value)}`;
}

// Rebuilds a full .md file. `blocks` (from an existing parsePost, or [] for
// a brand new post) is used to preserve any field this editor doesn't know
// about (like the FAQ post's `schema: |` block) untouched.
function buildPost({ title, date, description, body, blocks }) {
  const known = { title, date, description };
  const outLines = [];
  const seen = new Set();

  for (const b of blocks || []) {
    if (Object.prototype.hasOwnProperty.call(known, b.key)) {
      outLines.push(formatScalarLine(b.key, known[b.key]));
    } else {
      outLines.push(b.raw);
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

function slugify(text) {
  const map = {
    ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", I: "i", İ: "i",
    ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u",
  };
  const folded = String(text).split("").map((ch) => map[ch] || ch).join("");
  return folded
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

module.exports = { parsePost, buildPost, slugify };
