/**
 * Configuración central de Google AdSense.
 *
 * No usa variables de entorno: los valores viven aquí para que la monetización
 * funcione en producción sin ninguna configuración adicional.
 */

/** ID de editor (client) de la cuenta de AdSense. */
export const ADSENSE_CLIENT_ID = "ca-pub-7008735814072307";

/**
 * IDs de los bloques de anuncios manuales.
 *
 * Mientras estén vacíos, el componente `<AdUnit />` no renderiza nada y la
 * monetización funciona con "Auto Ads" (Google coloca los anuncios solo).
 * Cuando crees un bloque en el panel de AdSense (Anuncios → Por bloque de
 * anuncios), pega aquí su ID numérico de slot.
 */
export const ADSENSE_SLOTS = {
  /** Anuncio dentro del cuerpo del artículo. */
  article: "",
  /** Anuncio en la barra lateral. */
  sidebar: "",
  /** Anuncio entre secciones de la portada. */
  home: "",
} as const;

/** AdSense se considera activo siempre que haya un ID de editor configurado. */
export const isAdsEnabled = Boolean(ADSENSE_CLIENT_ID);

/**
 * Configuración de "Subscribe with Google" (Reader Revenue Manager).
 *
 * Habilita el aviso de suscripción/acceso de Google News sobre los artículos.
 * El ID de producto se obtiene en el panel de Reader Revenue Manager
 * (Publisher Center). Igual que AdSense, no usa variables de entorno para que
 * funcione en producción sin configuración adicional.
 */
export const SWG_PRODUCT_ID = "CAowjtDgCw:openaccess";

/** SWG se considera activo siempre que haya un ID de producto configurado. */
export const isSwgEnabled = Boolean(SWG_PRODUCT_ID);
