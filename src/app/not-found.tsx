// Fallback global para rutas profundas sin match (p. ej. /a/b/c).
// Las 404 del sitio público (notFound() en sus páginas) usan
// src/app/(public)/not-found.tsx, que sí incluye navbar y footer.
export { default } from "./(public)/not-found";
