"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, MessageCircle } from "lucide-react";

// Blog sayfalarında ana sayfayla aynı üst menü (aynı global sınıflar:
// nav.topnav, .nav-logo, .nav-links, #mobileMenu). Ana sayfadaki GSAP
// betiği burada yüklenmediği için kaydırma ve mobil menü davranışı burada.
const LINKS = [
  { href: "/#about", label: "Hakkımda" },
  { href: "/#ikas", label: "Ortaklıklar" },
  { href: "/#services", label: "Hizmetler" },
  { href: "/#process", label: "Süreç" },
  { href: "/#projects", label: "Projelerim" },
  { href: "/blog", label: "Blog" },
];

export default function MarketingNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    return () => document.body.classList.remove("menu-open");
  }, [open]);

  return (
    <>
      <nav className={`topnav${scrolled ? " scrolled" : ""}`}>
        <Link href="/" className="nav-logo">
          Kaan Tan<span className="dot">.</span>
        </Link>
        <ul className="nav-links">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href}>{l.label}</Link>
            </li>
          ))}
          <li>
            <Link href="/#contact" className="nav-cta">İletişime Geç</Link>
          </li>
        </ul>
        <button
          className="nav-burger"
          aria-label="Menüyü aç/kapat"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <Menu className="icon-open" size={20} />
          <X className="icon-close" size={20} />
        </button>
      </nav>

      <div id="mobileMenu">
        <ul>
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} onClick={() => setOpen(false)}>{l.label}</Link>
            </li>
          ))}
        </ul>
        <a href="https://wa.me/905422979212" target="_blank" rel="noopener" className="mm-cta">
          <MessageCircle size={20} /> WhatsApp&apos;tan Yaz
        </a>
      </div>
    </>
  );
}
