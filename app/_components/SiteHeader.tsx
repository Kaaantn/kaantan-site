"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";

const LINKS = [
  { href: "/#about", label: "Hakkımda", id: "about" },
  { href: "/#services", label: "Hizmetler", id: "services" },
  { href: "/#projects", label: "Projeler", id: "projects" },
  { href: "/blog", label: "Blog", id: "blog-page" },
  { href: "/#process", label: "Süreç", id: "process" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [sectionActive, setSectionActive] = useState<string>("");
  const active = pathname === "/" ? sectionActive : pathname.startsWith("/blog") ? "blog-page" : "";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Ana sayfada hangi bölümde olduğumuzu vurgula
  useEffect(() => {
    if (pathname !== "/") return;
    const ids = ["about", "ikas", "services", "projects", "blog", "process", "contact"];
    const targets = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setSectionActive(e.target.id));
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className={`sx-header${scrolled ? " is-scrolled" : ""}`}>
        <div className="sx-header-in">
          <Link href="/" className="sx-logo" aria-label="Kaan Tan — ana sayfa" onClick={() => setOpen(false)}>
            Kaan Tan<i />
          </Link>

          <nav className="sx-nav" aria-label="Ana menü">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className={active === l.id ? "is-active" : ""}>
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="sx-header-actions">
            <Link href="/#contact" className="sx-btn sx-btn-ink sx-btn-sm">
              İletişime Geç <ArrowUpRight size={15} />
            </Link>
            <button
              className="sx-burger"
              aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      <div className={`sx-drawer${open ? " is-open" : ""}`} aria-hidden={!open}>
        <nav>
          {LINKS.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{ transitionDelay: open ? `${80 + i * 45}ms` : "0ms" }}
            >
              <span>0{i + 1}</span>
              {l.label}
            </Link>
          ))}
        </nav>
        <a
          href="https://wa.me/905422979212"
          target="_blank"
          rel="noopener"
          className="sx-btn sx-btn-accent"
        >
          WhatsApp&apos;tan Yaz <ArrowUpRight size={16} />
        </a>
      </div>
    </>
  );
}
