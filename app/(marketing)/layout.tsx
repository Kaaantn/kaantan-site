import MarketingNav from "./MarketingNav";

// Blog sayfalarının ortak çerçevesi: ana sayfayla aynı üst menü ve alt bilgi.
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MarketingNav />

      {children}

      <footer>
        <div className="footer-logo">Kaan Tan<span className="dot">.</span></div>
        <div className="footer-copy">© 2026 · Tüm hakları saklıdır.</div>
      </footer>
    </>
  );
}
