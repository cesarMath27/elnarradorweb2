import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { WebsiteJsonLd } from "@/components/seo/JsonLd";
import AdSenseScript from "@/components/ads/AdSenseScript";
import SwgScript from "@/components/ads/SwgScript";

// Chrome público (navbar/footer/ads). Vive en un route group para que el
// layout raíz no tenga que leer headers() — leer headers() ahí forzaba
// renderizado dinámico de TODAS las páginas y anulaba el ISR (revalidate).
export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <WebsiteJsonLd />
      <AdSenseScript />
      <SwgScript />
      <Navbar />
      <main className="min-h-screen pt-[120px]">{children}</main>
      <Footer />
    </>
  );
}
