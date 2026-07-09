import { cache } from "react";
import { createPublicClient } from "./public";

export type Author = {
  id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  email: string | null;
  created_at: string;
};

export type NewsArticle = {
  id: string;
  source: "supabase" | "wordpress";
  title: string;
  summary: string;
  // Solo getNewsById lo incluye; las queries de listado lo omiten porque el
  // HTML completo de cada nota pesa mucho y parsearlo consume CPU de más.
  content?: string;
  image_url: string;
  category_slug: string;
  category_name: string;
  author_name: string;
  tags: string[];
  published_at: string;
  created_at: string;
  view_count: number;
  is_featured: boolean;
  is_breaking: boolean;
  source_url: string;
  authors?: Author[];
};

// Columnas para vistas de listado: todo menos `content`.
const LIST_COLUMNS =
  "id, source, title, summary, image_url, category_slug, category_name, author_name, tags, published_at, created_at, view_count, is_featured, is_breaking, source_url";

export async function getLatestNews(limit = 20, offset = 0) {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("news")
    .select(LIST_COLUMNS)
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data as unknown as NewsArticle[];
}

export async function getFeaturedNews() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("news")
    .select(LIST_COLUMNS)
    .eq("is_featured", true)
    .order("published_at", { ascending: false })
    .limit(5);

  if (error) throw error;
  return data as unknown as NewsArticle[];
}

export async function getBreakingNews() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("news")
    .select(LIST_COLUMNS)
    .eq("is_breaking", true)
    .order("published_at", { ascending: false })
    .limit(3);

  if (error) throw error;
  return data as unknown as NewsArticle[];
}

export async function getNewsByCategory(categorySlug: string, limit = 20) {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("news")
    .select(LIST_COLUMNS)
    .eq("category_slug", categorySlug)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as unknown as NewsArticle[];
}

// cache() deduplica la lectura cuando generateMetadata y la página piden
// el mismo artículo dentro del mismo render.
export const getNewsById = cache(async (id: string) => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as unknown as NewsArticle;
});

export async function searchNews(query: string, limit = 20) {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("news")
    .select(LIST_COLUMNS)
    .or(`title.ilike.%${query}%,summary.ilike.%${query}%,content.ilike.%${query}%`)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as unknown as NewsArticle[];
}

export async function getCategories() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getMostViewed(limit = 5) {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("news")
    .select(LIST_COLUMNS)
    .order("view_count", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as unknown as NewsArticle[];
}

export async function incrementViewCount(id: string) {
  const supabase = createPublicClient();
  const { error } = await supabase.rpc("increment_view_count", {
    news_id: id,
  });
  if (error) {
    // Fallback: direct update if RPC doesn't exist
    await supabase
      .from("news")
      .update({ view_count: 1 })
      .eq("id", id);
  }
}

/* ───── Authors ───── */

export async function getAuthors() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("authors")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data as unknown as Author[];
}

export async function getAuthorsByNewsId(newsId: string) {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("news_authors")
    .select("author_id, authors(*)")
    .eq("news_id", newsId);

  if (error) throw error;
  // Supabase tipa la relación como arreglo pero en runtime devuelve un objeto
  // para relaciones a-uno; aceptar ambas formas evita depender de ese detalle.
  const rows = (data ?? []) as unknown as { authors: Author | Author[] | null }[];
  return rows.flatMap((row) =>
    Array.isArray(row.authors) ? row.authors : row.authors ? [row.authors] : []
  );
}

export async function getNewsWithAuthors(newsId: string) {
  const article = await getNewsById(newsId);
  const authors = await getAuthorsByNewsId(newsId);
  return { ...article, authors };
}
