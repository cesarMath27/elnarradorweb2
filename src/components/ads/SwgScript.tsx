import Script from "next/script";
import { SWG_PRODUCT_ID, isSwgEnabled } from "@/lib/ads/config";

/**
 * Carga "Subscribe with Google" (Reader Revenue Manager) de Google News.
 *
 * El primer script descarga la librería `swg-basic.js` y el segundo la
 * inicializa para los artículos del sitio. Ambos usan la cola `SWG_BASIC`,
 * por lo que el orden de carga no es crítico: la librería procesa la cola al
 * cargar.
 *
 * Se monta solo en las páginas públicas, no en el panel `/admin`.
 */
export default function SwgScript() {
  if (!isSwgEnabled) return null;

  return (
    <>
      <Script
        id="swg-basic-loader"
        src="https://news.google.com/swg/js/v1/swg-basic.js"
        strategy="afterInteractive"
        type="application/javascript"
      />
      <Script id="swg-basic-init" strategy="afterInteractive">
        {`(self.SWG_BASIC = self.SWG_BASIC || []).push((basicSubscriptions) => {
  basicSubscriptions.init({
    type: "NewsArticle",
    isPartOfType: ["Product"],
    isPartOfProductId: "${SWG_PRODUCT_ID}",
    clientOptions: { theme: "light", lang: "es-419" },
  });
});`}
      </Script>
    </>
  );
}
