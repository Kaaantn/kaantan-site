import type { Metadata } from "next";
import Script from "next/script";
import {
  Menu,
  X,
  ArrowRight,
  Handshake,
  ShoppingBag,
  Megaphone,
  Award,
  Clock,
  MessageCircle,
  ShieldCheck,
  UserCheck,
  Phone,
  Mail,
  Globe,
  Camera,
  Music2,
  Briefcase,
  CirclePlay,
  Palette,
  Terminal,
  LayoutTemplate,
  Plug,
  Bell,
  Search,
  Zap,
  Cpu,
  Puzzle,
  Monitor,
  Wrench,
  ArrowUpRight,
  MapPin,
} from "lucide-react";
import HomeAnimations from "./HomeAnimations";

export const metadata: Metadata = {
  title: "Kaan Tan — Web, Otomasyon & İkas İş Ortağı",
  description:
    "Kaan Tan — solopreneur dijital çözüm ortağı. Profesyonel web sitesi, süreç otomasyonu, yapay zeka entegrasyonu ve İkas e-ticaret altyapısında iş ortaklığı. Ortalama 30 dakikada dönüş.",
  openGraph: {
    title: "Kaan Tan — Dijital Çözüm Ortağınız",
    description: "Web sitesi, otomasyon, yapay zeka ve İkas e-ticaret çözümleri. Tek elden, hızlı ve profesyonel.",
    type: "website",
  },
  other: {
    "google-site-verification": "VMhd9jIgzwx_419BiOH-2dOZIMNJtBFqGHhvunORR64",
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Kaan Tan",
  url: "https://kaantan.com.tr",
  jobTitle: "Yazılım Geliştirici, İçerik Üreticisi (Influencer) & Meta Reklam Yöneticisi",
  image: "https://kaantan.com.tr/bio/profil.jpg",
  description:
    "10 yılı aşkın deneyime sahip, İstanbul merkezli yazılım geliştiricisi. Aynı zamanda sosyal medyada içerik üreticisi (influencer) ve özellikle butik ayakkabı ve giyim mağazalarına Meta (Instagram/Facebook) reklam yöneticiliği hizmeti veren bir dijital çözüm ortağı. ikas ve Shopify partneri, e-ticaret altyapıları ve özel yazılım çözümleri üzerine çalışıyor.",
  knowsAbout: [
    "Web Geliştirme",
    "İkas E-Ticaret Altyapısı",
    "Shopify",
    "Süreç Otomasyonu",
    "Yapay Zeka Entegrasyonu",
    "Meta Reklam Yönetimi",
    "Butik Giyim ve Ayakkabı Mağazaları için Dijital Pazarlama",
    "Sosyal Medya İçerik Üretimi",
    "SEO",
  ],
  worksFor: { "@type": "Organization", name: "KT.", url: "https://kaantan.com.tr" },
  address: { "@type": "PostalAddress", addressLocality: "İstanbul", addressCountry: "TR" },
  email: "mailto:kaantanpr@gmail.com",
  telephone: "+905422979212",
  sameAs: [
    "https://instagram.com/qkaantan",
    "https://tiktok.com/@qkaantan",
    "https://linkedin.com/in/vekaantan",
    "https://youtube.com/@qkaantan",
    "https://www.behance.net/kaantan2",
    "https://github.com/Kaaantn",
  ],
};

export default function HomePage() {
  return (
    <>
      <Script
        id="person-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />

      <div id="c-dot"></div>
      <div id="c-ring"></div>
      <div className="cursor-glow" id="cursorGlow"></div>

      {/* ══ DOT NAV ══ */}
      <nav className="dot-nav" id="dotNav" aria-label="Bölüm gezinme">
        <a href="#about" className="dot-link" data-target="about"><span className="dot-label">Hakkımda</span><span className="dot"></span></a>
        <a href="#ikas" className="dot-link" data-target="ikas"><span className="dot-label">Ortaklıklar</span><span className="dot"></span></a>
        <a href="#services" className="dot-link" data-target="services"><span className="dot-label">Hizmetler</span><span className="dot"></span></a>
        <a href="#projects" className="dot-link" data-target="projects"><span className="dot-label">Projeler</span><span className="dot"></span></a>
        <a href="#process" className="dot-link" data-target="process"><span className="dot-label">Süreç</span><span className="dot"></span></a>
        <a href="#contact" className="dot-link" data-target="contact"><span className="dot-label">İletişim</span><span className="dot"></span></a>
      </nav>

      {/* ══ NAV ══ */}
      <nav className="topnav" id="navbar">
        <a href="#" className="nav-logo">Kaan Tan<span className="dot">.</span></a>
        <ul className="nav-links">
          <li><a href="#about">Hakkımda</a></li>
          <li><a href="#ikas">Ortaklıklar</a></li>
          <li><a href="#services">Hizmetler</a></li>
          <li><a href="#process">Süreç</a></li>
          <li><a href="#projects">Projelerim</a></li>
          <li><a href="/blog/">Blog</a></li>
          <li><a href="/shop/">Shop</a></li>
          <li><a href="#contact" className="nav-cta">İletişime Geç</a></li>
        </ul>
        <button className="nav-burger" id="burgerBtn" aria-label="Menüyü aç/kapat" aria-expanded="false">
          <Menu className="icon-open" size={20} />
          <X className="icon-close" size={20} />
        </button>
      </nav>

      {/* ══ MOBILE MENU ══ */}
      <div id="mobileMenu">
        <ul>
          <li><a href="#about">Hakkımda</a></li>
          <li><a href="#ikas">Ortaklıklar</a></li>
          <li><a href="#services">Hizmetler</a></li>
          <li><a href="#projects">Projelerim</a></li>
          <li><a href="#process">Süreç</a></li>
          <li><a href="/blog/">Blog</a></li>
          <li><a href="/shop/">Shop</a></li>
        </ul>
        <a href="https://wa.me/905422979212" target="_blank" rel="noopener" className="mm-cta">
          <MessageCircle size={20} /> WhatsApp&apos;tan Yaz
        </a>
      </div>

      {/* ══ HERO ══ */}
      <section id="hero">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="hero-grid"></div>

        <div className="hero-layout">
          <div className="hero-content">
            <div className="hero-eyebrow">Yeni: Meta &amp; TikTok Ads Yönetimi</div>

            <h1 className="hero-name">
              <span className="line-1" id="heroLine1">Kaan Tan</span>
              <span className="line-2" id="heroLine2">Dijital Çözüm Ortağınız</span>
            </h1>

            <p className="hero-sub">
              Web sitesi, otomasyon, yapay zeka ve İkas e-ticaret altyapısı —{" "}
              <strong>işinizi büyütecek dijital çözümleri</strong> tek elden, hızlı ve profesyonelce hayata geçiriyorum.
            </p>

            <div className="hero-actions">
              <a href="https://wa.me/905422979212" target="_blank" rel="noopener" className="btn-primary">
                Hemen Başlayalım <ArrowRight />
              </a>
              <a href="#services" className="btn-secondary">Ne Yapabiliriz?</a>
            </div>

            <div className="trust-row">
              <div className="trust-item"><Handshake /> İkas İş Ortağı</div>
              <div className="trust-item"><ShoppingBag /> Shopify İş Ortağı</div>
              <div className="trust-item"><Megaphone /> Meta &amp; TikTok Ads</div>
              <div className="trust-item"><Award /> 10+ Yıl Deneyim</div>
              <div className="trust-item"><Clock /> 30 Dakika Yanıt</div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hv-orb"></div>

            <div className="float-card fc-partner">
              <div className="fc-ico"><Handshake /></div>
              <div><strong>İkas İş Ortağı</strong><span>E-ticaret çözümleri</span></div>
            </div>

            <div className="float-card fc-partner fc-shopify">
              <div className="fc-ico"><ShoppingBag /></div>
              <div><strong>Shopify İş Ortağı</strong><span>Global e-ticaret</span></div>
            </div>

            <div className="float-card fc-stat">
              <div className="fc-num"><span className="count" data-to="30">0</span><span>dk</span></div>
              <div className="fc-cap">Ortalama Yanıt Süresi</div>
            </div>

            <div className="float-card fc-msg">
              <div className="fc-msg-head"><MessageCircle /><span>WhatsApp</span></div>
              <p>Merhaba, proje detaylarını konuşalım.</p>
            </div>

            <div className="float-card fc-avail">
              <span className="fc-dot"></span>
              <span>Yeni Projelere Açığım</span>
            </div>
          </div>
        </div>

        <div className="scroll-hint">
          <span>Kaydır</span>
          <div className="scroll-line"></div>
        </div>
      </section>

      {/* ══ MARQUEE ══ */}
      <div className="marquee">
        <div className="marquee-track" id="marqueeTrack">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i}>
              {[
                "Web Tasarımı",
                "Meta Reklam Yönetimi",
                "TikTok Ads Yönetimi",
                "Süreç Otomasyonu",
                "Yapay Zeka Entegrasyonu",
                "İkas E-Ticaret",
                "Chrome Eklentisi",
                "Masaüstü Uygulama",
                "SEO Optimizasyonu",
                "UI/UX Tasarım",
              ].map((item) => (
                <span key={item}>
                  <span className="marquee-item">{item}</span>
                  <span className="marquee-sep"></span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ══ PARTNER STRIP ══ */}
      <div className="partner-strip">
        <ShieldCheck />
        <p><strong>İkas</strong> e-ticaret altyapısında iş ortağıyım — mağaza kurulumundan otomasyona uçtan uca destek.</p>
      </div>
      <div className="partner-strip">
        <Megaphone />
        <p><strong>Meta &amp; TikTok Ads</strong> yönetimi hizmetlerim arasında — özellikle butik ayakkabı ve giyim mağazalarına özel kampanya yönetimi.</p>
      </div>

      {/* ══ STATS ══ */}
      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-num"><span className="count" data-to="10">0</span><span className="stat-suffix">+</span></div>
          <div className="stat-label">Yıl Deneyim</div>
        </div>
        <div className="stat-item">
          <div className="stat-num"><span className="stat-prefix">%</span><span className="count" data-to="100">0</span></div>
          <div className="stat-label">Müşteri Memnuniyeti</div>
        </div>
        <div className="stat-item">
          <div className="stat-num"><span className="count" data-to="30">0</span><span className="stat-suffix">dk</span></div>
          <div className="stat-label">Yanıt Süresi</div>
        </div>
        <div className="stat-item">
          <div className="stat-num infinity">∞</div>
          <div className="stat-label">Revizyon Hakkı</div>
        </div>
      </div>

      {/* ══ ABOUT ══ */}
      <section id="about">
        <div className="section-inner">
          <div className="reveal">
            <div className="section-eyebrow">Hakkımda</div>
            <h2 className="section-title">Bir kişi, <br />sınırsız çözüm.</h2>
          </div>

          <div className="about-grid">
            <div className="about-visual reveal">
              <div className="about-card-main">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/about3.png" alt="Kaan Tan" className="about-photo" />
                <div className="about-badge">
                  <UserCheck />
                  <div>Solopreneur<small>Tek elden, hızlı teslimat</small></div>
                </div>
              </div>
            </div>

            <div className="about-text reveal">
              <p className="about-body">
                Merhaba, ben <strong>Kaan Tan.</strong> Tek başıma çalışan, büyük ajans maliyeti olmayan bir dijital çözüm üreticisiyim.
                <br /><br />
                Web tasarımından otomasyon sistemlerine, tarayıcı eklentilerinden İkas altyapılı e-ticaret sitelerine kadar — <strong>işinizi büyütecek her şeyi</strong> hızla hayata geçiriyorum.
              </p>
              <div className="skill-tags">
                <span className="tag">Web Tasarım</span>
                <span className="tag">İkas E-Ticaret</span>
                <span className="tag">Otomasyon</span>
                <span className="tag">Yapay Zeka</span>
                <span className="tag">Chrome Extension</span>
                <span className="tag">Masaüstü Uygulama</span>
                <span className="tag">SEO</span>
                <span className="tag">Meta Reklam Yönetimi</span>
                <span className="tag">İçerik Üretimi</span>
              </div>
            </div>
          </div>

          <div className="hk-grid">
            <div className="hk-bio reveal">
              <p className="about-body hk-bio-p">2015&apos;ten beri yazılım geliştiriyorum. 10 yılı aşkın süredir kod yazan, web siteleri ve e-ticaret sistemleri kuran, İstanbul merkezli bir yazılım geliştiricisiyim. KT. markası altında hem kendi ürünlerimi geliştiriyorum hem de işletmelere özel projeler üretiyorum.</p>
              <p className="about-body hk-bio-p">ikas partneri ve Shopify partneri olarak, Türkiye&apos;nin ve dünyanın en çok kullanılan e-ticaret altyapılarında hem uygulama geliştiriyor hem de bu platformlar üzerinde mağaza kurulumu, entegrasyon ve özel çözüm ihtiyaçlarına destek oluyorum.</p>
              <p className="about-body hk-bio-p">Yaptığım işler geniş bir yelpazede: e-ticaret altyapıları için mağaza içi uygulamalar (şu an ikas App Store&apos;da Kartio, Takiplio ve Barlio uygulamalarım yayında), kurumsal ve bireysel işletmeler için özel web siteleri, yönetim panelleri, bayi/dağıtıcı sistemleri gibi B2B2C platformları, ve ihtiyaca göre uçtan uca özel yazılım çözümleri geliştiriyorum. Kısacası, bir fikri alıp çalışan bir ürüne dönüştürme sürecinin her aşamasında yer alıyorum — tasarımdan geliştirmeye, entegrasyondan yayına kadar.</p>
              <p className="about-body hk-bio-p">Yazılım geliştirmenin yanı sıra aynı anda birden fazla rolü bir arada yürütüyorum: sosyal medyada içerik üreticisi (influencer) olarak Instagram, TikTok ve YouTube&apos;da teknoloji ve yapay zeka içerikleri paylaşıyorum; özellikle <strong>butik ayakkabı ve giyim mağazalarına</strong> Meta (Instagram/Facebook) reklam yöneticiliği hizmeti veriyorum; ve tüm bunları yazılım/e-ticaret işimle eş zamanlı yürütüyorum.</p>
              <p className="about-body hk-bio-p" style={{ marginBottom: 0 }}>Küçük bir işletmenin ilk web sitesinden, büyüyen bir e-ticaret markasının özel yazılım altyapısına kadar geniş bir yelpazede çalışıyorum. Eğer bir projeniz varsa veya e-ticaret tarafında yardıma ihtiyacınız varsa, benimle iletişime geçebilirsiniz.</p>
            </div>

            <div className="hk-side reveal">
              <div className="hk-side-title">İletişim</div>
              <div className="hk-contact-list">
                <a href="tel:+905422979212" className="hk-contact-item">
                  <div className="hk-contact-icon"><Phone /></div>
                  <div><div className="hk-contact-label">Telefon</div><div className="hk-contact-value">+90 542 297 9212</div></div>
                </a>
                <a href="mailto:kaantanpr@gmail.com" className="hk-contact-item">
                  <div className="hk-contact-icon"><Mail /></div>
                  <div><div className="hk-contact-label">E-posta</div><div className="hk-contact-value">kaantanpr@gmail.com</div></div>
                </a>
                <a href="https://kaantan.com.tr" className="hk-contact-item">
                  <div className="hk-contact-icon"><Globe /></div>
                  <div><div className="hk-contact-label">Web</div><div className="hk-contact-value">kaantan.com.tr</div></div>
                </a>
              </div>

              <div className="hk-side-title">Sosyal Medya &amp; Platformlar</div>
              <div className="hk-social-grid">
                <a href="https://instagram.com/qkaantan" target="_blank" rel="noopener" className="hk-social-link"><Camera /> @qkaantan</a>
                <a href="https://tiktok.com/@qkaantan" target="_blank" rel="noopener" className="hk-social-link"><Music2 /> @qkaantan</a>
                <a href="https://linkedin.com/in/vekaantan" target="_blank" rel="noopener" className="hk-social-link"><Briefcase /> /in/vekaantan</a>
                <a href="https://youtube.com/@qkaantan" target="_blank" rel="noopener" className="hk-social-link"><CirclePlay /> @qkaantan</a>
                <a href="https://www.behance.net/kaantan2" target="_blank" rel="noopener" className="hk-social-link"><Palette /> kaantan2</a>
                <a href="https://github.com/Kaaantn" target="_blank" rel="noopener" className="hk-social-link"><Terminal /> Kaaantn</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATEMENT ══ */}
      <section className="statement">
        <div className="section-inner">
          <p className="statement-text" id="statementText">Web sitesinden otomasyona, yapay zekadan İkas altyapılı e-ticarete işinizi büyütecek her şeyi tek elden hayata geçiriyorum.</p>
        </div>
      </section>

      {/* ══ IKAS PARTNERSHIP ══ */}
      <section id="ikas">
        <div className="section-inner">
          <div className="reveal">
            <div className="section-eyebrow">İkas &amp; Shopify İş Ortaklığı</div>
            <h2 className="section-title">E-ticaret sitenizi<br />büyütüyoruz.</h2>
          </div>

          <div className="ikas-grid">
            <div className="ikas-text reveal">
              <p className="section-desc" style={{ maxWidth: "none", marginBottom: "8px" }}>
                Türkiye&apos;nin hızla büyüyen e-ticaret altyapısı <strong style={{ color: "var(--ink)" }}>İkas</strong>&apos;ın ve global e-ticaret devi <strong style={{ color: "var(--ink)" }}>Shopify</strong>&apos;ın iş ortağıyım. Mağaza kurulumundan tema özelleştirmeye, entegrasyonlardan otomasyona kadar İkas ve Shopify tabanlı projelerinizi uçtan uca hayata geçiriyorum.
              </p>

              <div className="ikas-list">
                <div className="ikas-item"><div className="ico"><ShoppingBag /></div><p>Mağaza kurulumu ve platform taşıma</p></div>
                <div className="ikas-item"><div className="ico"><LayoutTemplate /></div><p>Markanıza özel tema tasarımı ve özelleştirme</p></div>
                <div className="ikas-item"><div className="ico"><Plug /></div><p>Ödeme, kargo ve pazaryeri entegrasyonları</p></div>
                <div className="ikas-item"><div className="ico"><Bell /></div><p>Sipariş ve stok otomasyonu, bildirim sistemleri</p></div>
                <div className="ikas-item"><div className="ico"><Search /></div><p>Hız ve SEO optimizasyonu</p></div>
              </div>

              <a href="https://wa.me/905422979212?text=Merhaba%20Kaan%2C%20e-ticaret%20projem%20hakk%C4%B1nda%20konu%C5%9Fmak%20istiyorum." target="_blank" rel="noopener" className="btn-primary">
                E-Ticaret Projemi Konuşalım <ArrowRight />
              </a>
            </div>

            <div className="ikas-card reveal">
              <div className="ikas-wordmark">ikas<span>.</span> <span className="ikas-wordmark-plus">+ Shopify</span></div>
              <div className="ikas-card-role">E-ticaret Altyapı Platformları</div>
              <div className="ikas-cert"><Handshake /> İkas &amp; Shopify İş Ortağı</div>
              <div className="ikas-card-name">Kaan Tan<small>Solopreneur · Türkiye</small></div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ SERVICES ══ */}
      <section id="services">
        <div className="section-inner">
          <div className="services-header reveal">
            <div>
              <div className="section-eyebrow">Hizmetler</div>
              <h2 className="section-title">Ne yapabilirim?</h2>
            </div>
            <p className="section-desc" style={{ maxWidth: "320px" }}>
              Tek seferlik proje veya uzun vadeli iş birliği — her ikisi de mümkün.
            </p>
          </div>

          <div className="services-grid">
            <div className="service-card b-large reveal">
              <div className="service-icon"><Globe /></div>
              <h3 className="service-title">Profesyonel Web Sitesi</h3>
              <p className="service-desc">Kurumsal, portföy veya e-ticaret — markanıza özel, hızlı, mobil uyumlu ve arama motorlarına hazır web siteleri tasarlıyor ve geliştiriyorum.</p>
              <div className="mini-chips">
                <span className="mini-chip">Kurumsal</span>
                <span className="mini-chip">Portföy</span>
                <span className="mini-chip">E-Ticaret</span>
              </div>
            </div>

            <div className="service-card b-wide reveal">
              <div className="service-icon"><ShoppingBag /></div>
              <h3 className="service-title">İkas E-Ticaret Kurulumu</h3>
              <p className="service-desc">İkas altyapısında mağaza kurulumu, tema özelleştirme ve entegrasyonlar — iş ortağı desteğiyle uçtan uca.</p>
              <span className="service-tag">İkas İş Ortağı</span>
            </div>

            <div className="service-card b-wide reveal">
              <div className="service-icon"><Megaphone /></div>
              <h3 className="service-title">Meta &amp; TikTok Ads Yönetimi</h3>
              <p className="service-desc">Butik ayakkabı ve giyim mağazaları başta olmak üzere, Instagram, Facebook ve TikTok reklamlarınızı uçtan uca yönetiyorum — hedef kitle, bütçe optimizasyonu ve dönüşüm takibiyle satışa odaklı kampanyalar.</p>
              <span className="service-tag">Butik Mağazalara Özel</span>
            </div>

            <div className="service-card reveal">
              <div className="service-icon"><Zap /></div>
              <h3 className="service-title">Süreç Otomasyonu</h3>
              <p className="service-desc">Form, e-posta, bildirim, veri aktarımı — elle yapılan her şey otomatikleşebilir.</p>
              <span className="service-tag">Zaman Kazandırır</span>
            </div>

            <div className="service-card reveal">
              <div className="service-icon"><Cpu /></div>
              <h3 className="service-title">Yapay Zeka Entegrasyonu</h3>
              <p className="service-desc">Müşteri hizmetleri botu, içerik üretimi, veri analizi veya akıllı öneri sistemleri.</p>
              <span className="service-tag">Rekabet Avantajı</span>
            </div>

            <div className="service-card reveal">
              <div className="service-icon"><Puzzle /></div>
              <h3 className="service-title">Chrome Eklentisi</h3>
              <p className="service-desc">Ekibinizin kullandığı araçlara entegre, markanıza özel tarayıcı eklentisi geliştirme.</p>
              <span className="service-tag">Prodüktivite</span>
            </div>

            <div className="service-card reveal">
              <div className="service-icon"><Monitor /></div>
              <h3 className="service-title">Masaüstü Uygulama</h3>
              <p className="service-desc">Windows veya Mac için özel iş uygulamaları — muhasebe, stok takip, iç araçlar.</p>
              <span className="service-tag">Özel Yazılım</span>
            </div>

            <div className="service-card b-wide reveal">
              <div className="service-icon"><Wrench /></div>
              <h3 className="service-title">Bakım &amp; Destek</h3>
              <p className="service-desc">Siteniz ve araçlarınız sürekli güncel, güvende ve takipte. WhatsApp üzerinden anlık destek.</p>
              <span className="service-tag">Sürekli Destek</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══ PROJECTS ══ */}
      <section id="projects">
        <div className="section-inner">
          <div className="reveal">
            <div className="section-eyebrow">Yaptıklarım</div>
            <h2 className="section-title">Canlıda çalışan<br />projeler.</h2>
          </div>

          <div className="projects-grid">
            <div className="project-card reveal">
              <div className="project-live-badge">Canlı</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <div className="project-icon project-icon--logo"><img src="/icon-1024.png" alt="Kartio logosu" loading="lazy" /></div>
              <h3 className="project-name">Kartio</h3>
              <p className="project-desc">ikas App Store&apos;da yayınlanan sipariş ve hediye kartı uygulaması. Mağaza sahibi isim, tip, süsleme ve renk seçiyor; A4 sayfaya dizilmiş, kesime hazır PDF çıktısı otomatik oluşuyor.</p>
              <div className="project-stack">
                <span className="project-tech">Next.js</span><span className="project-tech">ikas OAuth2</span><span className="project-tech">Prisma</span><span className="project-tech">jsPDF</span>
              </div>
              <a href="https://apps.ikas.com/tr/uygulama/87c77f53-71b6-45fa-9b23-fb0d3d109878" target="_blank" rel="noopener" className="project-link">Uygulamaya Git <ArrowUpRight /></a>
            </div>

            <div className="project-card reveal">
              <div className="project-live-badge">Canlı</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <div className="project-icon project-icon--logo"><img src="/takiplio.png" alt="Takiplio logosu" loading="lazy" /></div>
              <h3 className="project-name">Takiplio</h3>
              <p className="project-desc">ikas App Store&apos;da yayınlanan sipariş ve kargo takip uygulaması. Müşteriler sipariş numarası ve e-posta/telefon ile kargo durumunu anlık sorgular; destek yükü azalır, mağaza sahibine günlük/haftalık sorgu istatistikleri sunulur.</p>
              <div className="project-stack">
                <span className="project-tech">Next.js</span><span className="project-tech">ikas OAuth2</span><span className="project-tech">Kargo API Entegrasyonu</span>
              </div>
              <a href="https://apps.ikas.com/tr/uygulama/9bf35a46-9994-47e9-9e55-97e636660a8b" target="_blank" rel="noopener" className="project-link">Uygulamaya Git <ArrowUpRight /></a>
            </div>

            <div className="project-card reveal">
              <div className="project-live-badge">Canlı</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <div className="project-icon project-icon--logo"><img src="/barlio.png" alt="Barlio logosu" loading="lazy" /></div>
              <h3 className="project-name">Barlio</h3>
              <p className="project-desc">ikas App Store&apos;da yayınlanan ücretsiz kargo ilerleme çubuğu uygulaması. Sepet tutarı arttıkça bar gerçek zamanlı güncellenir, müşteriyi eşiğe ulaşmaya teşvik ederek sepet ortalamasını ve tamamlama oranını yükseltir.</p>
              <div className="project-stack">
                <span className="project-tech">Next.js</span><span className="project-tech">ikas OAuth2</span><span className="project-tech">Gerçek Zamanlı Widget</span>
              </div>
              <a href="https://apps.ikas.com/tr/uygulama/f11c28a4-db00-4fb5-8835-1c9bd381529a" target="_blank" rel="noopener" className="project-link">Uygulamaya Git <ArrowUpRight /></a>
            </div>
          </div>
        </div>
      </section>

      {/* ══ PROCESS ══ */}
      <section id="process">
        <div className="section-inner">
          <div className="reveal" style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 20px" }}>
            <div className="section-eyebrow" style={{ justifyContent: "center", display: "flex" }}>Nasıl Çalışırız</div>
            <h2 className="section-title">Basit süreç,<br />hızlı sonuç.</h2>
          </div>

          <div className="process-steps">
            <div className="step reveal">
              <div className="step-num">01</div>
              <h4 className="step-title">İletişime Geç</h4>
              <p className="step-desc">WhatsApp&apos;tan mesaj atın, ihtiyaçlarınızı anlatın. Ortalama 30 dakikada dönüş yapıyorum.</p>
            </div>
            <div className="step reveal">
              <div className="step-num">02</div>
              <h4 className="step-title">Planlama</h4>
              <p className="step-desc">İçerik ve tasarım tercihlerinizi alıyorum. Size özel bir plan hazırlıyorum.</p>
            </div>
            <div className="step reveal">
              <div className="step-num">03</div>
              <h4 className="step-title">Geliştirme</h4>
              <p className="step-desc">Sitenizi veya çözümünüzü hızla hayata geçiriyorum. Sizi süreçte bilgilendiriyorum.</p>
            </div>
            <div className="step reveal">
              <div className="step-num">04</div>
              <h4 className="step-title">Teslim &amp; Destek</h4>
              <p className="step-desc">Projeyi teslim ediyorum. Revizyon ve sorularınız için her zaman buradayım.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CONTACT ══ */}
      <section id="contact">
        <div className="section-inner">
          <div className="contact-grid">
            <div className="contact-text reveal">
              <div className="section-eyebrow">İletişim</div>
              <h2 className="section-title">Konuşalım.</h2>
              <p className="section-desc" style={{ marginBottom: "40px" }}>
                Projeniz büyük ya da küçük olsun fark etmez. Ne yapmak istediğinizi anlatın, birlikte en iyi çözümü bulalım.
              </p>

              <div className="contact-detail">
                <div className="contact-icon"><MessageCircle /></div>
                <div><div className="contact-label">WhatsApp</div><div className="contact-value">+90 542 297 92 12</div></div>
              </div>
              <div className="contact-detail">
                <div className="contact-icon"><MapPin /></div>
                <div><div className="contact-label">Konum</div><div className="contact-value">Türkiye · Remote çalışıyorum</div></div>
              </div>
              <div className="contact-detail">
                <div className="contact-icon"><Clock /></div>
                <div><div className="contact-label">Yanıt Süresi</div><div className="contact-value">Genellikle 30 dakika içinde</div></div>
              </div>
            </div>

            <div className="contact-cta-box reveal">
              <h3 className="contact-cta-title">Projenizi hemen<br />hayata geçirelim</h3>
              <p className="contact-cta-sub">
                Ne yapmak istediğinizi anlatın, genellikle 30 dakika içinde dönüş yapıyorum.
              </p>
              <a href="https://wa.me/905422979212?text=Merhaba%20Kaan,%20projem%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum." target="_blank" rel="noopener" className="btn-whatsapp">
                <MessageCircle /> WhatsApp&apos;tan Yaz
              </a>
              <p className="response-note"><Zap /> Ortalama 30 dakikada dönüş yapıyorum</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer>
        <div className="footer-logo">Kaan Tan<span className="dot">.</span></div>
        <div className="footer-copy">© 2026 · Tüm hakları saklıdır.</div>
      </footer>

      <HomeAnimations />
    </>
  );
}
