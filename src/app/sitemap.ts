import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://elnarradordemexico.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch all news articles
  const { data: articles } = await supabase
    .from("news")
    .select("id, published_at, category_slug")
    .order("published_at", { ascending: false });

  // Fetch all magazines
  const { data: magazines } = await supabase
    .from("magazines")
    .select("id, published_at")
    .order("published_at", { ascending: false });

  const categories = [
    "mexico", "economia", "cultura", "internacional", "deportes",
    "estilo", "ciencia", "opinion", "sociedad", "tecnologia",
  ];

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/revistas`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/buscar`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((slug) => ({
    url: `${SITE_URL}/${slug}`,
    lastModified: new Date(),
    changeFrequency: "hourly" as const,
    priority: 0.9,
  }));

  const articlePages: MetadataRoute.Sitemap = (articles || []).map((article) => ({
    url: `${SITE_URL}/articulo/${article.id}`,
    lastModified: new Date(article.published_at),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const magazinePages: MetadataRoute.Sitemap = (magazines || []).map((mag) => ({
    url: `${SITE_URL}/revistas/${mag.id}`,
    lastModified: new Date(mag.published_at),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages, ...articlePages, ...magazinePages];
}
