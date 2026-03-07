import { createClient } from "@supabase/supabase-js";

const WP_API = process.env.WORDPRESS_API_URL || "https://elnarradordemexico.com/wp-json/wp/v2";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

type WPPost = {
  id: number;
  date: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  link: string;
  categories: number[];
  tags: number[];
  featured_media: number;
  _embedded?: {
    "wp:featuredmedia"?: Array<{ source_url: string }>;
    "wp:term"?: Array<Array<{ id: number; name: string; slug: string }>>;
    author?: Array<{ name: string }>;
  };
};

type WPCategory = {
  id: number;
  name: string;
  slug: string;
  count: number;
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, " ").trim();
}

export async function fetchWPCategories(): Promise<WPCategory[]> {
  const res = await fetch(`${WP_API}/categories?per_page=100`);
  if (!res.ok) throw new Error(`Failed to fetch categories: ${res.status}`);
  return res.json();
}

export async function fetchWPPosts(page = 1, perPage = 20): Promise<{ posts: WPPost[]; totalPages: number }> {
  const res = await fetch(
    `${WP_API}/posts?page=${page}&per_page=${perPage}&_embed=1&orderby=date&order=desc`
  );
  if (!res.ok) throw new Error(`Failed to fetch posts: ${res.status}`);

  const totalPages = parseInt(res.headers.get("X-WP-TotalPages") || "1");
  const posts = await res.json();
  return { posts, totalPages };
}

export async function migrateFromWordPress(options: {
  maxPages?: number;
  dryRun?: boolean;
}) {
  const { maxPages = 1, dryRun = false } = options;
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const results = {
    categoriesMigrated: 0,
    postsMigrated: 0,
    postsSkipped: 0,
    errors: [] as string[],
  };

  // Step 1: Fetch and sync categories
  try {
    const wpCategories = await fetchWPCategories();

    if (!dryRun) {
      for (const cat of wpCategories) {
        const { error } = await supabase
          .from("categories")
          .upsert(
            {
              id: cat.slug,
              name: cat.name,
              sort_order: 0,
            },
            { onConflict: "id" }
          );

        if (error) {
          results.errors.push(`Category ${cat.name}: ${error.message}`);
        } else {
          results.categoriesMigrated++;
        }
      }
    } else {
      results.categoriesMigrated = wpCategories.length;
    }
  } catch (e) {
    results.errors.push(`Categories fetch failed: ${e}`);
  }

  // Step 2: Fetch and migrate posts
  for (let page = 1; page <= maxPages; page++) {
    try {
      const { posts, totalPages } = await fetchWPPosts(page);

      for (const post of posts) {
        const imageUrl =
          post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "";
        const categories = post._embedded?.["wp:term"]?.[0] || [];
        const authorName = post._embedded?.author?.[0]?.name || "Redacción";
        const tags =
          post._embedded?.["wp:term"]?.[1]?.map((t) => t.name) || [];
        const category = categories[0];

        const newsItem = {
          id: `wp-${post.id}`,
          source: "wordpress" as const,
          title: stripHtml(post.title.rendered),
          summary: stripHtml(post.excerpt.rendered).substring(0, 300),
          content: post.content.rendered,
          image_url: imageUrl,
          category_slug: category?.slug || "",
          category_name: category?.name || "",
          author_name: authorName,
          tags,
          published_at: post.date,
          source_url: post.link,
          view_count: 0,
          is_featured: false,
          is_breaking: false,
        };

        if (!dryRun) {
          const { error } = await supabase
            .from("news")
            .upsert(newsItem, { onConflict: "id" });

          if (error) {
            results.errors.push(
              `Post "${newsItem.title.substring(0, 40)}...": ${error.message}`
            );
            results.postsSkipped++;
          } else {
            results.postsMigrated++;
          }
        } else {
          results.postsMigrated++;
        }
      }

      if (page >= totalPages) break;
    } catch (e) {
      results.errors.push(`Page ${page} fetch failed: ${e}`);
      break;
    }
  }

  return results;
}
