"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { addAdminUser, removeAdminUser, getAdminUserByEmail } from "@/lib/supabase/admin-users";

export async function addUserAction(formData: FormData) {
  // Verify the caller is an authorized admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "No autorizado" };

  const caller = await getAdminUserByEmail(user.email);
  if (!caller || caller.role !== "owner") {
    return { error: "Solo los propietarios pueden agregar usuarios" };
  }

  const email = formData.get("email") as string;
  const displayName = formData.get("display_name") as string;
  const role = formData.get("role") as "owner" | "editor" | "writer";

  if (!email || !displayName || !role) {
    return { error: "Todos los campos son obligatorios" };
  }

  const result = await addAdminUser(email, displayName, role);
  if (result.error) return { error: result.error };

  revalidatePath("/admin/usuarios");
  return { success: true };
}

export async function removeUserAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "No autorizado" };

  const caller = await getAdminUserByEmail(user.email);
  if (!caller || caller.role !== "owner") {
    return { error: "Solo los propietarios pueden eliminar usuarios" };
  }

  const id = formData.get("id") as string;

  // Prevent owner from removing themselves
  if (id === caller.id) {
    return { error: "No puedes eliminarte a ti mismo" };
  }

  const result = await removeAdminUser(id);
  if (result.error) return { error: result.error };

  revalidatePath("/admin/usuarios");
  return { success: true };
}
