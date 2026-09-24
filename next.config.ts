import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  async redirects() {
    return [
      // Eski Eleventy sitesinin görsel adresleri (Google Görseller / paylaşılmış linkler kırılmasın)
      { source: "/assets/:path*", destination: "/:path*", permanent: true },
      { source: "/profil.jpg", destination: "/bio/profil.jpg", permanent: true },
      // Shop sayfası kaldırıldı
      { source: "/shop", destination: "/blog", permanent: true },
      // Eski yönetim panelleri artık /control altında
      { source: "/panel", destination: "/control/instagram", permanent: false },
      { source: "/bio-admin", destination: "/control/bio", permanent: false },
      { source: "/blog-admin", destination: "/control/blog", permanent: false },
      { source: "/admin", destination: "/control/blog", permanent: false },
    ];
  },
};

export default nextConfig;
