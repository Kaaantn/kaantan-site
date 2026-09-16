import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { tarih } from "@/lib/dates";
import styles from "../marketing.module.css";

export const metadata: Metadata = {
  title: "Blog — Kaan Tan Blog",
  description: "Kaan Tan'ın e-ticaret, İkas, Shopify ve yazılım geliştirme üzerine yazıları.",
  openGraph: {
    title: "Blog",
    description: "Kaan Tan'ın e-ticaret, İkas, Shopify ve yazılım geliştirme üzerine yazıları.",
    type: "article",
  },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <div className={styles.wrap}>
      <div className={styles.postEyebrow}>Blog</div>
      <h1 className={styles.postTitle}>Yazılar</h1>
      <p style={{ color: "var(--muted)", marginBottom: "40px" }}>
        E-ticaret, İkas, Shopify ve yazılım geliştirme üzerine notlar.
      </p>

      {posts.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>Henüz yazı yok, yakında burada olacak.</p>
      ) : (
        posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}/`} className={styles.postListItem}>
            <div className={styles.postListDate}>{tarih(post.date)}</div>
            <div className={styles.postListTitle}>{post.title}</div>
            <div className={styles.postListDesc}>{post.description}</div>
          </Link>
        ))
      )}
    </div>
  );
}
