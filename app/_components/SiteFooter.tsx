import Link from "next/link";

const SOCIAL = [
  { href: "https://instagram.com/qkaantan", label: "Instagram" },
  { href: "https://tiktok.com/@qkaantan", label: "TikTok" },
  { href: "https://youtube.com/@qkaantan", label: "YouTube" },
  { href: "https://linkedin.com/in/vekaantan", label: "LinkedIn" },
  { href: "https://github.com/Kaaantn", label: "GitHub" },
  { href: "https://www.behance.net/kaantan2", label: "Behance" },
];

export default function SiteFooter() {
  return (
    <footer className="sx-footer">
      <div className="sx-wrap sx-footer-in">
        <div className="sx-footer-brand">
          <Link href="/" className="sx-logo">
            Kaan Tan<i />
          </Link>
          <p>
            Web, otomasyon, yapay zeka ve e-ticaret. İstanbul&apos;dan, tek elden.
          </p>
        </div>

        <div className="sx-footer-col">
          <h4>Sayfalar</h4>
          <Link href="/#about">Hakkımda</Link>
          <Link href="/#services">Hizmetler</Link>
          <Link href="/#projects">Projeler</Link>
          <Link href="/blog">Blog</Link>
        </div>

        <div className="sx-footer-col">
          <h4>Sosyal</h4>
          {SOCIAL.map((s) => (
            <a key={s.href} href={s.href} target="_blank" rel="noopener">
              {s.label}
            </a>
          ))}
        </div>

        <div className="sx-footer-col">
          <h4>İletişim</h4>
          <a href="https://wa.me/905422979212" target="_blank" rel="noopener">
            +90 542 297 92 12
          </a>
          <a href="mailto:kaantanpr@gmail.com">kaantanpr@gmail.com</a>
        </div>
      </div>
      <div className="sx-wrap sx-footer-bottom">
        <span>© 2026 Kaan Tan. Tüm hakları saklıdır.</span>
        <span>kaantan.com.tr</span>
      </div>
    </footer>
  );
}
