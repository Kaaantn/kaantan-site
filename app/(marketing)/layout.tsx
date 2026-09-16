import Link from "next/link";
import styles from "./marketing.module.css";

// Shared chrome for /blog, /blog/[slug], /shop — ported from _includes/base.njk.
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav className={styles.nav}>
        <Link href="/" className={styles.navLogo}>
          Kaan Tan<span>.</span>
        </Link>
        <ul className={styles.navLinks}>
          <li><Link href="/">Anasayfa</Link></li>
          <li><Link href="/blog/">Blog</Link></li>
          <li><Link href="/shop/">Shop</Link></li>
          <li><Link href="/#contact">İletişim</Link></li>
        </ul>
      </nav>

      {children}

      <div className={styles.footer}>
        <div>
          Kaan Tan<span style={{ color: "var(--lime-600)" }}>.</span> © 2026 · Tüm hakları saklıdır.
        </div>
        <Link href="/">kaantan.com.tr</Link>
      </div>
    </>
  );
}
