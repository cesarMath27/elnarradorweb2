import { createClient } from "./server";
import { createAdminClient } from "./admin";

export type AdminUser = {
  id: string;
  email: string;
  display_name: string;
  role: "owner" | "editor" | "writer";
  created_at: string;
};

/**
 * Check if the given email is an authorized admin user.
 * Returns the admin user record or null.
 */
export async function getAdminUserByEmail(email: string): Promise<AdminUser | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("admin_users")
    .select("*")
    .eq("email", email.toLowerCase())
    .single();

  if (error || !data) return null;
  return data as AdminUser;
}

/**
 * Get all admin users (for the management page).
 */
export async function getAdminUsers(): Promise<AdminUser[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("admin_users")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) return [];
  return data as AdminUser[];
}

/**
 * Add a new admin user. Uses the service-role client to bypass RLS.
 */
export async function addAdminUser(email: string, displayName: string, role: AdminUser["role"]) {
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.from("admin_users").insert({
    email: email.toLowerCase().trim(),
    display_name: displayName.trim(),
    role,
  });
  if (error) return { error: error.message };
  return { success: true };
}

/**
 * Remove an admin user by id. Uses the service-role client.
 */
export async function removeAdminUser(id: string) {
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.from("admin_users").delete().eq("id", id);
  if (error) return { error: error.message };
  return { success: true };
}
