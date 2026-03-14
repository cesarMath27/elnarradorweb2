/**
 * Converts a text string into a URL-friendly slug.
 * Handles Spanish diacritics (á, é, í, ó, ú, ñ, ü).
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Builds a descriptive, shareable article URL.
 * Format: /articulo/UUID/titulo-descriptivo-del-articulo
 */
export function getArticleUrl(article: { id: string; title: string }): string {
  const slug = slugify(article.title);
  return slug ? `/articulo/${article.id}/${slug}` : `/articulo/${article.id}`;
}
