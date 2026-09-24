"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ExternalLink,
  FileText,
  LayoutDashboard,
  Lightbulb,
  Link2,
  MessageCircle,
  Wallet,
} from "lucide-react";
import SignOutButton from "./SignOutButton";

const NAV = [
  { href: "/control", label: "Genel Bakış", short: "Bakış", icon: LayoutDashboard, exact: true },
  { href: "/control/instagram", label: "Instagram", short: "Instagram", icon: MessageCircle },
  { href: "/control/bio", label: "Bio Sayfası", short: "Bio", icon: Link2 },
  { href: "/control/blog", label: "Blog", short: "Blog", icon: FileText },
];

const SOON = [
  { label: "Gelir – Gider", icon: Wallet },
  { label: "İçerik Fikirleri", icon: Lightbulb },
  { label: "Takvim", icon: CalendarDays },
];

// Kabuk: masaüstünde sol menü, mobilde üst çubuk + alt sekme çubuğu.
export default function PanelShell({ email, children }: { email: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href));

  return (
    <div className="cp-shell">
      <aside className="cp-side">
        <div className="cp-brand">
          <Link href="/control">
            Kaan Tan<i />
          </Link>
          <small>Kontrol Paneli</small>
        </div>

        <nav className="cp-nav" aria-label="Panel menüsü">
          {NAV.map(({ href, label, icon: Icon, exact }) => (
            <Link key={href} href={href} className={isActive(href, exact) ? "is-active" : ""}>
              <Icon size={18} />
              {label}
            </Link>
          ))}

          <div className="cp-nav-label">Yakında</div>
          {SOON.map(({ label, icon: Icon }) => (
            <div key={label} className="cp-soon">
              <Icon size={18} />
              {label}
              <em>yakında</em>
            </div>
          ))}

          <div className="cp-nav-label">Siteler</div>
          <a href="/" target="_blank" rel="noopener">
            <ExternalLink size={18} />
            Ana site
          </a>
          <a href="/bio" target="_blank" rel="noopener">
            <ExternalLink size={18} />
            Bio sayfası
          </a>
        </nav>

        <div className="cp-side-foot">
          {email && <div className="cp-user">{email}</div>}
          <SignOutButton />
        </div>
      </aside>

      <div className="cp-main">
        <header className="cp-topbar">
          <div className="cp-brand">
            <Link href="/control">
              Kaan Tan<i />
            </Link>
          </div>
          <SignOutButton compact />
        </header>

        <div className="cp-content">{children}</div>
      </div>

      <nav className="cp-tabbar" aria-label="Panel menüsü">
        {NAV.map(({ href, short, icon: Icon, exact }) => (
          <Link key={href} href={href} className={isActive(href, exact) ? "is-active" : ""}>
            <Icon size={20} />
            {short}
          </Link>
        ))}
      </nav>
    </div>
  );
}
