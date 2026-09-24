import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  FileText,
  Lightbulb,
  Link2,
  MessageCircle,
  Plus,
  Wallet,
} from "lucide-react";
import { getBioConfig } from "@/lib/bio";
import { getAllPosts } from "@/lib/posts";
import * as igRepo from "@/lib/ig/repo";

export const dynamic = "force-dynamic";

async function loadStats() {
  try {
    const [bio, configs, states] = await Promise.all([
      getBioConfig(),
      igRepo.getConfigs(),
      igRepo.listStates(),
    ]);
    const bioClicks =
      bio.links.reduce((n, l) => n + (l.clicks || 0), 0) +
      bio.socialLinks.reduce((n, s) => n + (s.clicks || 0), 0);
    return {
      dmSent: states.filter((s) => !s.dmFailed).length,
      followers: states.filter((s) => s.becameFollower).length,
      activeTriggers: configs.posts.filter((p) => p.active !== false).length,
      bioLinks: bio.links.length,
      bioClicks,
    };
  } catch {
    return null;
  }
}

const MODULES = [
  {
    href: "/control/instagram",
    icon: MessageCircle,
    title: "Instagram",
    desc: "Yorum tetikleyicileri, otomatik DM ve genel ayarlar.",
  },
  {
    href: "/control/bio",
    icon: Link2,
    title: "Bio Sayfası",
    desc: "Profil, sosyal medya ve link listesini düzenle.",
  },
  {
    href: "/control/blog",
    icon: FileText,
    title: "Blog",
    desc: "Yazı ekle, düzenle, sil. Kaydedince canlıya ~30-60 sn içinde çıkar.",
  },
];

export default async function DashboardPage() {
  const stats = await loadStats();
  const postCount = getAllPosts().length;
  const hour = (new Date().getUTCHours() + 3) % 24; // Türkiye saati
  const greet = hour < 6 ? "İyi geceler" : hour < 12 ? "Günaydın" : hour < 18 ? "İyi günler" : "İyi akşamlar";

  return (
    <div>
      <div className="cp-head">
        <div>
          <h1>{greet}, Kaan.</h1>
          <p>Sitenin ve otomasyonların özeti burada. Bir modül seçip devam edebilirsin.</p>
        </div>
        <div className="cp-head-actions">
          <Link href="/control/blog" className="cp-btn cp-btn-primary">
            <Plus size={16} /> Yeni yazı
          </Link>
          <Link href="/control/instagram" className="cp-btn cp-btn-ghost">
            <Plus size={16} /> Yeni tetikleyici
          </Link>
        </div>
      </div>

      <div className="cp-stats is-4" style={{ marginBottom: 28 }}>
        <div className="cp-stat">
          <b>{stats ? stats.dmSent : "—"}</b>
          <span>Gönderilen otomatik DM</span>
        </div>
        <div className="cp-stat">
          <b>{stats ? stats.activeTriggers : "—"}</b>
          <span>Aktif Instagram tetikleyicisi</span>
        </div>
        <div className="cp-stat">
          <b>{stats ? stats.bioClicks : "—"}</b>
          <span>Bio sayfası tıklaması</span>
        </div>
        <div className="cp-stat">
          <b>{postCount}</b>
          <span>Yayındaki blog yazısı</span>
        </div>
      </div>

      <div className="cp-modules">
        {MODULES.map(({ href, icon: Icon, title, desc }) => (
          <Link key={href} href={href} className="cp-module">
            <div className="cp-module-ico">
              <Icon size={22} />
            </div>
            <h3>{title}</h3>
            <p>{desc}</p>
          </Link>
        ))}
      </div>

      <div className="cp-card" style={{ marginTop: 28 }}>
        <div className="cp-card-head">
          <h2>Sırada</h2>
          <span className="cp-chip">planlanan modüller</span>
        </div>
        <div className="cp-soon-grid">
          <div className="cp-soon-card">
            <Wallet size={18} /> Gelir – Gider tablosu <em>yakında</em>
          </div>
          <div className="cp-soon-card">
            <Lightbulb size={18} /> İçerik fikirleri <em>yakında</em>
          </div>
          <div className="cp-soon-card">
            <CalendarDays size={18} /> İçerik takvimi <em>yakında</em>
          </div>
        </div>
      </div>

      <div className="cp-actions" style={{ marginTop: 6 }}>
        <a href="/" target="_blank" rel="noopener" className="cp-btn cp-btn-ghost cp-btn-sm">
          Ana siteyi aç <ArrowUpRight size={14} />
        </a>
        <a href="/bio" target="_blank" rel="noopener" className="cp-btn cp-btn-ghost cp-btn-sm">
          Bio sayfasını aç <ArrowUpRight size={14} />
        </a>
        <a href="/blog" target="_blank" rel="noopener" className="cp-btn cp-btn-ghost cp-btn-sm">
          Blogu aç <ArrowUpRight size={14} />
        </a>
      </div>
    </div>
  );
}
