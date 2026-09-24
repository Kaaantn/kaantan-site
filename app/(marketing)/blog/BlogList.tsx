"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import styles from "../marketing.module.css";

interface Item {
  slug: string;
  title: string;
  description: string;
  dateLabel: string;
}

// Türkçe karakterleri (ı, ş, ğ...) yok sayan basit arama normalizasyonu
const norm = (s: string) =>
  s
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

export default function BlogList({ items }: { items: Item[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const terms = norm(q).split(/\s+/).filter(Boolean);
    if (!terms.length) return items;
    return items.filter((it) => {
      const hay = norm(`${it.title} ${it.description}`);
      return terms.every((t) => hay.includes(t));
    });
  }, [q, items]);

  return (
    <>
      <div className={styles.tools}>
        <label className={styles.search}>
          <Search size={18} />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Yazılarda ara: amazon, tiktok, ikas…"
            aria-label="Yazılarda ara"
          />
        </label>
        <span className={styles.count} aria-live="polite">
          {filtered.length} / {items.length} yazı
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className={styles.empty}>“{q}” için yazı bulunamadı. Başka bir kelime deneyin.</p>
      ) : (
        <div className={styles.postGrid}>
          {filtered.map((it) => (
            <Link key={it.slug} href={`/blog/${it.slug}`} className={styles.postListItem}>
              <div className={styles.postListDate}>{it.dateLabel}</div>
              <div className={styles.postListTitle}>{it.title}</div>
              <div className={styles.postListDesc}>{it.description}</div>
              <span className={styles.postListMore}>Yazıyı oku →</span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
