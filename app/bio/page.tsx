import type { Metadata } from "next";
import Link from "next/link";
import {
  MapPin, Mail, Phone, Briefcase, Terminal, Palette, Link as LinkIcon,
  Mic, Search, Star, ShoppingBag, Globe, MessageCircle, Activity, FileText, ArrowRight,
} from "lucide-react";
import { getBioConfig, type BioLink, type BioSocialLink } from "@/lib/bio";
import { getYoutubeSubscriberCount } from "@/lib/socialStats";
import styles from "./bio.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kaan Tan",
  robots: { index: false, follow: false },
};

function clickUrl(type: "social" | "link", id: string) {
  return `/api/public/bio-click?type=${encodeURIComponent(type)}&id=${encodeURIComponent(id)}`;
}

const LINK_ICONS: Record<string, React.ReactNode> = {
  mic: <Mic />,
  search: <Search />,
  star: <Star />,
  "shopping-bag": <ShoppingBag />,
  globe: <Globe />,
  "message-circle": <MessageCircle />,
  activity: <Activity />,
  terminal: <Terminal />,
  "file-text": <FileText />,
};

function SocialIcon({ platform }: { platform: string }) {
  switch (platform) {
    case "youtube":
      return (
        <svg viewBox="0 0 24 24" fill="white">
          <path d="M8 5v14l11-7z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="7" cy="18" r="3" fill="white" stroke="none" />
          <path d="M10 18V4l7-1.5V9" />
          <circle cx="17" cy="10.5" r="3" />
        </svg>
      );
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}>
          <rect x="2" y="2" width="20" height="20" rx="6" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="18" cy="6" r="1.1" fill="white" stroke="none" />
        </svg>
      );
    case "linkedin":
      return <Briefcase color="white" />;
    case "github":
      return <Terminal color="white" />;
    case "behance":
      return <Palette color="white" />;
    default:
      return <LinkIcon color="white" />;
  }
}

function LinkCardIcon({ link }: { link: BioLink }) {
  if (link.icon === "kt-logo") {
    return (
      <svg viewBox="0 0 32 32" fill="none">
        <path
          d="M11 7v18M11 16l9-9M11 16l9 9"
          stroke={link.iconColor || "#0A0A0A"}
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (link.icon === "image" && link.iconImage) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={link.iconImage} alt={link.title} />;
  }
  return <>{LINK_ICONS[link.icon] || <LinkIcon />}</>;
}

export default async function BioPage() {
  const bio = await getBioConfig();
  const youtubeCount = await getYoutubeSubscriberCount();

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.banner} style={{ backgroundColor: bio.bannerColor || "#E5471B" }} />
        <div className={styles.profile}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bio.avatar || ""} alt={bio.displayName || ""} className={styles.avatar} />
          <div className={styles.name}>{bio.displayName || ""}</div>

          {bio.location && (
            <div className={styles.location}>
              <MapPin />
              <span>{bio.location}</span>
            </div>
          )}
          {bio.bio && <div className={styles.bio}>{bio.bio}</div>}

          {(bio.showEmail && bio.email) || (bio.showPhone && bio.phone) ? (
            <div className={styles.contactRow}>
              {bio.showEmail && bio.email && (
                <a href={`mailto:${bio.email}`} className={styles.contactBtn}>
                  <Mail /> E-posta
                </a>
              )}
              {bio.showPhone && bio.phone && (
                <a href={`tel:${bio.phone}`} className={styles.contactBtn}>
                  <Phone /> Ara
                </a>
              )}
            </div>
          ) : null}

          <div className={styles.followRow}>
            {bio.socialLinks.map((s: BioSocialLink) => {
              const label = s.platform === "youtube" ? "Abone Ol" : "Takip Et";
              let count: string | null = null;
              if (s.live && s.platform === "youtube" && youtubeCount != null) {
                count = `${youtubeCount.toLocaleString("tr-TR")} abone`;
              } else if (s.followerCount) {
                count = s.followerCount;
              }
              const pillClass = [styles.followPill, styles[s.platform as keyof typeof styles]]
                .filter(Boolean)
                .join(" ");
              return (
                <a key={s.platform} href={clickUrl("social", s.platform)} className={pillClass}>
                  <div className={styles.fpIcon}>
                    <SocialIcon platform={s.platform} />
                  </div>
                  {label}
                  {count && <span className={styles.fpCount}>{count}</span>}
                </a>
              );
            })}
          </div>
        </div>

        <div className={styles.links}>
          {bio.links.map((link: BioLink) => {
            const color = link.color || bio.bannerColor || "#E5471B";
            const iconColor = link.iconColor || "#0A0A0A";
            return (
              <a key={link.id} href={clickUrl("link", link.id)} className={styles.linkCard}>
                <div className={styles.linkIcon} style={{ background: color, color: iconColor }}>
                  <LinkCardIcon link={link} />
                </div>
                <div className={styles.linkText}>
                  <div className={styles.linkTitle}>{link.title}</div>
                  {link.subtitle && <div className={styles.linkSub}>{link.subtitle}</div>}
                  {link.perk && <div className={styles.linkPerk}>{link.perk}</div>}
                </div>
                <ArrowRight className={styles.linkArrow} />
              </a>
            );
          })}
        </div>
      </div>
      <Link href="/" className={styles.home}>
        kaantan.com.tr →
      </Link>
    </div>
  );
}
