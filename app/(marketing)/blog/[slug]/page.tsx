import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";
import { marked } from "marked";
import { getPostBySlug, getPostSlugs } from "@/lib/posts";
import { tarih } from "@/lib/dates";
import styles from "../../marketing.module.css";

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} — Kaan Tan Blog`,
    description: post.description,
    openGraph: { title: post.title, description: post.description, type: "article" },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const html = marked.parse(post.body, { async: false }) as string;

  return (
    <div className={styles.wrap}>
      {post.schema && (
        <Script
          id={`post-jsonld-${post.slug}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: post.schema }}
        />
      )}

      <Link href="/blog/" className={styles.backLink}>
        ← Tüm yazılar
      </Link>
      <div className={styles.postEyebrow}>Blog</div>
      <h1 className={styles.postTitle}>{post.title}</h1>
      <div className={styles.postMeta}>{tarih(post.date)}</div>
      {post.cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.cover} alt={post.title} className={styles.postCover} />
      )}
      <div className={styles.postBody} dangerouslySetInnerHTML={{ __html: html }} />
      <div className={styles.ctaBox}>
        <p>Bir projeniz mi var? Konuşalım.</p>
        <a href="https://wa.me/905422979212" target="_blank" rel="noopener">
          WhatsApp&apos;tan Yaz →
        </a>
      </div>
    </div>
  );
}
