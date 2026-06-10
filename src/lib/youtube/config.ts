// Canal de YouTube de El Narrador de México.
//
// YOUTUBE_CHANNEL es el handle público del canal (con @). El ID interno se
// resuelve automáticamente en el servidor y se cachea.
//
// YOUTUBE_CHANNEL_ID (opcional) es el ID interno que empieza con "UC...".
// Si se rellena, se usa directamente y se omite la resolución del handle —
// es la vía más confiable. Se obtiene en YouTube Studio > Configuración >
// Canal > Configuración avanzada.
//
// Igual que la configuración de AdSense, no usa variables de entorno: si
// ambos valores quedan vacíos, la sección de videos no se renderiza.
export const YOUTUBE_CHANNEL = "@ElNarradordeMéxico";
export const YOUTUBE_CHANNEL_ID = "";

// URL pública del canal, usada para el enlace "Ver canal".
export const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@ElNarradordeMéxico";
