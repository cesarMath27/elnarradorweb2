import { createClient } from "./server";

export type NewsArticle = {
  id: string;
  source: "supabase" | "wordpress";
  title: string;
  summary: string;
  content: string;
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
};

export async function getLatestNews(limit = 20, offset = 0) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data as NewsArticle[];
}

export async function getFeaturedNews() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .eq("is_featured", true)
    .order("published_at", { ascending: false })
    .limit(5);

  if (error) throw error;
  return data as NewsArticle[];
}

export async function getBreakingNews() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .eq("is_breaking", true)
    .order("published_at", { ascending: false })
    .limit(3);

  if (error) throw error;
  return data as NewsArticle[];
}

export async function getNewsByCategory(categorySlug: string, limit = 20) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .eq("category_slug", categorySlug)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as NewsArticle[];
}

export async function getNewsById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as NewsArticle;
}

export async function searchNews(query: string, limit = 20) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .or(`title.ilike.%${query}%,summary.ilike.%${query}%,content.ilike.%${query}%`)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as NewsArticle[];
}

export async function getCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getMostViewed(limit = 5) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .order("view_count", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as NewsArticle[];
}

export async function incrementViewCount(id: string) {
  const supabase = await createClient();
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
