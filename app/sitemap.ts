import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { isoDate } from "@/lib/dates";

// Replaces blog/sitemap.njk.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://kaantan.com.tr";
  const posts = getAllPosts();

  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/blog/`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/shop/`, changeFrequency: "weekly", priority: 0.7 },
    ...posts.map((post) => ({
      url: `${base}/blog/${post.slug}/`,
      lastModified: isoDate(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
