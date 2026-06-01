import Script from "next/script";
import { ADSENSE_CLIENT_ID, isAdsEnabled } from "@/lib/ads/config";

/**
 * Carga el script global de Google AdSense.
 *
 * Una vez presente, habilita los "Auto Ads" (Google coloca los anuncios
 * automáticamente tras aprobar el sitio) y permite renderizar bloques manuales
 * mediante el componente `<AdUnit />`.
 *
 * Se monta solo en las páginas públicas, no en el panel `/admin`.
 */
export default function AdSenseScript() {
  if (!isAdsEnabled) return null;

  return (
    <Script
      id="adsbygoogle-loader"
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
    />
  );
}
