import type { MetadataRoute } from "next";

// Replaces robots.txt. /admin (Decap CMS) is retired in this rebuild;
// /control (the private panel, Faz 1) and /bio (personal link-in-bio card)
// stay disallowed, matching the noindex meta on /bio itself.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/bio/", "/control/"],
    },
    sitemap: "https://kaantan.com.tr/sitemap.xml",
  };
}
