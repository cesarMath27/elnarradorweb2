import { createClient } from "./server";

export type Magazine = {
  id: string;
  title: string;
  description: string;
  cover_image_url: string;
  pdf_url: string;
  edition: string;
  published_at: string;
  created_at: string;
  is_featured: boolean;
  view_count: number;
  download_count: number;
};

export async function getMagazines(limit = 20) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("magazines")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as Magazine[];
}

export async function getMagazineById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("magazines")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Magazine;
}

export async function getFeaturedMagazines() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("magazines")
    .select("*")
    .eq("is_featured", true)
    .order("published_at", { ascending: false })
    .limit(3);

  if (error) throw error;
  return data as Magazine[];
}
