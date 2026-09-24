import Link from "next/link";
import { ArrowUpRight, CalendarDays, FileText, Link2, MessageCircle, Plus, Wallet } from "lucide-react";
import { getBioConfig } from "@/lib/bio";
import { getAllPosts } from "@/lib/posts";
import * as igRepo from "@/lib/ig/repo";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatMoney, monthKey, monthLabel, summarize, todayKey, type FinanceEntry } from "@/lib/finance";
import { platformLabel, statusLabel, type ContentItem } from "@/lib/content";

export const dynamic = "force-dynamic";

async function loadStats() {
  try {
    const [bio, configs, states] = await Promise.all([getBioConfig(), igRepo.getConfigs(), igRepo.listStates()]);
    const bioClicks =
      bio.links.reduce((n, l) => n + (l.clicks || 0), 0) + bio.socialLinks.reduce((n, s) => n + (s.clicks || 0), 0);
    return {
      dmSent: states.filter((s) => !s.dmFailed).length,
      activeTriggers: configs.posts.filter((p) => p.active !== false).length,
      bioClicks,
    };
  } catch {
    return null;
  }
}

async function loadFinance() {
  try {
    const supabase = createAdminClient();
    const month = monthKey(todayKey());
    const { data } = await supabase
      .from("finance_entries")
      .select("type,amount,currency,category,status,entry_date,title,note,id")
      .gte("entry_date", `${month}-01`)
      .lte("entry_date", `${month}-31`);
    const entries = (data || []).map((e) => ({ ...e, amount: Number(e.amount) })) as FinanceEntry[];
    return { month, summary: summarize(entries, "TRY"), count: entries.length };
  } catch {
    return null;
  }
}

async function loadUpcoming() {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("content_items")
      .select("id,title,platform,status,scheduled_for")
      .gte("scheduled_for", todayKey())
      .neq("status", "published")
      .order("scheduled_for", { ascending: true })
      .limit(5);
    return (data || []) as ContentItem[];
  } catch {
    return [];
  }
}

const MODULES = [
  { href: "/control/instagram", icon: MessageCircle, title: "Instagram", desc: "Yorum tetikleyicileri, otomatik DM ve genel ayarlar." },
  { href: "/control/bio", icon: Link2, title: "Bio Sayfası", desc: "Profil, sosyal medya ve link listesini düzenle." },
  { href: "/control/blog", icon: FileText, title: "Blog", desc: "Yazı ekle, düzenle, sil. Kaydedince canlıya ~30-60 sn içinde çıkar." },
  { href: "/control/finance", icon: Wallet, title: "Gelir – Gider", desc: "Kazançlarını ve harcamalarını kaydet, aylık özeti gör." },
  { href: "/control/content", icon: CalendarDays, title: "İçerik Planı", desc: "Fikirden yayına pano, takvim ve liste görünümü." },
];

export default async function DashboardPage() {
  const [stats, fin, upcoming] = await Promise.all([loadStats(), loadFinance(), loadUpcoming()]);
  const postCount = getAllPosts().length;
  const hour = (new Date().getUTCHours() + 3) % 24; // Türkiye saati
  const greet = hour < 6 ? "İyi geceler" : hour < 12 ? "Günaydın" : hour < 18 ? "İyi günler" : "İyi akşamlar";

  return (
    <div>
      <div className="cp-head">
        <div>
          <h1>{greet}, Kaan.</h1>
          <p>Sitenin, otomasyonların ve işlerinin özeti burada. Bir modül seçip devam edebilirsin.</p>
        </div>
        <div className="cp-head-actions">
          <Link href="/control/blog" className="cp-btn cp-btn-primary">
            <Plus size={16} /> Yeni yazı
          </Link>
          <Link href="/control/finance" className="cp-btn cp-btn-ghost">
            <Plus size={16} /> Gelir / gider
          </Link>
        </div>
      </div>

      <div className="cp-stats is-4" style={{ marginBottom: 18 }}>
        <div className="cp-stat is-income">
          <span>{fin ? `${monthLabel(fin.month)} geliri` : "Aylık gelir"}</span>
          <b>{fin ? formatMoney(fin.summary.income, "TRY") : "—"}</b>
        </div>
        <div className="cp-stat is-expense">
          <span>Aylık gider</span>
          <b>{fin ? formatMoney(fin.summary.expense, "TRY") : "—"}</b>
        </div>
        <div className="cp-stat is-net">
          <span>Net</span>
          <b className={fin && fin.summary.net < 0 ? "neg" : ""}>{fin ? formatMoney(fin.summary.net, "TRY") : "—"}</b>
        </div>
        <div className="cp-stat">
          <span>Bekleyen tahsilat</span>
          <b>{fin ? formatMoney(fin.summary.pendingIncome, "TRY") : "—"}</b>
        </div>
      </div>

      <div className="cp-two">
        <section className="cp-card">
          <div className="cp-card-head">
            <h2>Yaklaşan içerikler</h2>
            <Link href="/control/content" className="cp-btn cp-btn-ghost cp-btn-sm">
              Takvimi aç <ArrowUpRight size={14} />
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="cp-empty" style={{ padding: "18px 0" }}>Planlanmış içerik yok. Takvimden bir güne tıklayıp ekleyebilirsin.</p>
          ) : (
            <div className="cp-list">
              {upcoming.map((i) => (
                <div key={i.id} className="cp-row" style={{ alignItems: "center" }}>
                  <div className="cp-entry-date">
                    <b>{(i.scheduled_for || "").slice(8)}</b>
                    <span>{new Intl.DateTimeFormat("tr-TR", { month: "short" }).format(new Date((i.scheduled_for || todayKey()) + "T00:00:00"))}</span>
                  </div>
                  <div className="cp-row-main">
                    <div className="cp-row-title">{i.title}</div>
                    <div className="cp-chips" style={{ marginTop: 6 }}>
                      <span className={`cp-chip plat-${i.platform}`}>{platformLabel(i.platform)}</span>
                      <span className="cp-chip is-accent">{statusLabel(i.status)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="cp-card">
          <div className="cp-card-head">
            <h2>Otomasyon ve site</h2>
          </div>
          <div className="cp-stats" style={{ gridTemplateColumns: "1fr 1fr" }}>
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
        </section>
      </div>

      <div className="cp-modules" style={{ marginTop: 6 }}>
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

      <div className="cp-actions" style={{ marginTop: 20 }}>
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
