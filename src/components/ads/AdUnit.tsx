"use client";

import { useEffect, useRef } from "react";
import { ADSENSE_CLIENT_ID } from "@/lib/ads/config";

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

type AdUnitProps = {
  /** ID numérico del bloque de anuncios (slot) del panel de AdSense. */
  slot?: string;
  /** Formato del anuncio. "auto" se adapta al contenedor; "fluid" para nativo. */
  format?: string;
  /** Permite que el anuncio ocupe todo el ancho responsivo. */
  responsive?: boolean;
  /** Clave de diseño para bloques nativos (p. ej. "in-article", "in-feed"). */
  layout?: string;
  /** Clases extra para el contenedor. */
  className?: string;
  /** Estilos en línea aplicados al elemento <ins>. */
  style?: React.CSSProperties;
  /** Muestra una etiqueta "Publicidad" sobre el anuncio (recomendado). */
  label?: boolean;
};

/**
 * Bloque de anuncio de AdSense reutilizable.
 *
 * Si no se configura un `slot` no renderiza nada, de modo que el diseño nunca
 * muestra un hueco de anuncio vacío. Los Auto Ads siguen funcionando a través
 * del script global aunque este componente no se use.
 */
export default function AdUnit({
  slot,
  format = "auto",
  responsive = true,
  layout,
  className = "",
  style,
  label = true,
}: AdUnitProps) {
  const pushed = useRef(false);

  useEffect(() => {
    if (!slot || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // El script de AdSense está bloqueado o aún no está listo: ignorar.
    }
  }, [slot]);

  if (!slot) return null;

  const isFluid = format === "fluid" || Boolean(layout);

  return (
    <div className={`my-6 text-center ${className}`}>
      {label && (
        <span className="block text-[10px] uppercase tracking-widest text-muted-light mb-1">
          Publicidad
        </span>
      )}
      <ins
        className="adsbygoogle"
        style={{ display: "block", ...(isFluid ? { textAlign: "center" } : {}), ...style }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        {...(layout ? { "data-ad-layout": layout } : {})}
        {...(!isFluid ? { "data-full-width-responsive": responsive ? "true" : "false" } : {})}
      />
    </div>
  );
}
