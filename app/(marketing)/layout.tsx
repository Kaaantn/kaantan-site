import SiteHeader from "../_components/SiteHeader";
import SiteFooter from "../_components/SiteFooter";

// Blog sayfalarının ortak çerçevesi: ana sayfayla aynı üst menü ve alt bilgi.
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
