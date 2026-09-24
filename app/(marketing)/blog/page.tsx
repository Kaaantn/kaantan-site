import type { Metadata } from "next";
import { getAllPosts } from "@/lib/posts";
import { tarih } from "@/lib/dates";
import styles from "../marketing.module.css";
import BlogList from "./BlogList";

export const metadata: Metadata = {
  title: "Blog — Kaan Tan Blog",
  description: "Kaan Tan'ın e-ticaret, İkas, Shopify ve yazılım geliştirme üzerine yazıları.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog",
    description: "Kaan Tan'ın e-ticaret, İkas, Shopify ve yazılım geliştirme üzerine yazıları.",
    type: "article",
  },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();
  const items = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    dateLabel: tarih(p.date),
  }));

  return (
    <div className={styles.wrapWide}>
      <div className={styles.postEyebrow}>Blog</div>
      <h1 className={styles.pageTitle}>Yazılar</h1>
      <p className={styles.pageLead}>
        E-ticaret, Amazon, İkas, Shopify, içerik üreticiliği ve yazılım üzerine rehberler.
      </p>

      {items.length === 0 ? (
        <p className={styles.empty}>Henüz yazı yok, yakında burada olacak.</p>
      ) : (
        <BlogList items={items} />
      )}
    </div>
  );
}
