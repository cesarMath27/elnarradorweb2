"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

export async function loginAdmin(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/", "layout");
    redirect("/admin");
}

export async function logoutAdmin() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/admin/login");
}

function generateSlug(title: string) {
    return title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
}

export async function uploadNews(formData: FormData) {
    try {
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            return { error: "Configuración del servidor incompleta: falta SUPABASE_SERVICE_ROLE_KEY." };
        }

        const supabaseAdmin = createAdminClient();

        const title = formData.get("title") as string;
        const summary = formData.get("summary") as string;
        const content = formData.get("content") as string;
        const category_name = formData.get("category_name") as string;
        const category_slug = (formData.get("category_slug") as string | null)?.toLowerCase() ?? "";
        const author_name = formData.get("author_name") as string;
        const is_featured = formData.get("is_featured") === "on";
        const is_breaking = formData.get("is_breaking") === "on";

        const imageOption = formData.get("imageOption") as string;
        let image_url = "";

        if (imageOption === "url") {
            image_url = formData.get("imageUrl") as string;
        } else {
            const file = formData.get("imageFile") as File;
            if (file && file.size > 0) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}-${generateSlug(title)}.${fileExt}`;
                const filePath = `news/${fileName}`;

                const { error: uploadError } = await supabaseAdmin.storage
                    .from("media")
                    .upload(filePath, file);

                if (uploadError) return { error: `Error al subir imagen: ${uploadError.message}` };

                const { data: publicUrl } = supabaseAdmin.storage.from("media").getPublicUrl(filePath);
                image_url = publicUrl.publicUrl;
            }
        }

        const { error: insertError } = await supabaseAdmin.from("news").insert({
            title,
            summary,
            content,
            category_slug,
            category_name,
            author_name,
            image_url,
            is_featured,
            is_breaking,
            tags: [],
            source: "supabase",
            published_at: new Date().toISOString()
        });

        if (insertError) return { error: `Error al guardar la nota: ${insertError.message}` };

        revalidatePath("/", "layout");
        return { success: true };
    } catch (err) {
        const message = err instanceof Error ? err.message : "Error inesperado al publicar la nota.";
        return { error: message };
    }
}

export async function uploadMagazine(formData: FormData) {
    const supabaseAdmin = createAdminClient();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const edition = formData.get("edition") as string;
    const is_featured = formData.get("is_featured") === "on";

    const coverFile = formData.get("coverImage") as File;
    const pdfFile = formData.get("pdfFile") as File;

    let cover_image_url = "";
    let pdf_url = "";

    if (coverFile && coverFile.size > 0) {
        const fileExt = coverFile.name.split('.').pop();
        const fileName = `${Date.now()}-cover-${generateSlug(title)}.${fileExt}`;
        const filePath = `magazines/${fileName}`;
        const { error } = await supabaseAdmin.storage.from("media").upload(filePath, coverFile);
        if (error) return { error: `Cover upload failed: ${error.message}` };
        const { data: publicUrl } = supabaseAdmin.storage.from("media").getPublicUrl(filePath);
        cover_image_url = publicUrl.publicUrl;
    }

    if (pdfFile && pdfFile.size > 0) {
        const fileExt = pdfFile.name.split('.').pop();
        const fileName = `${Date.now()}-pdf-${generateSlug(title)}.${fileExt}`;
        const filePath = `magazines/${fileName}`;
        const { error } = await supabaseAdmin.storage.from("media").upload(filePath, pdfFile);
        if (error) return { error: `PDF upload failed: ${error.message}` };
        const { data: publicUrl } = supabaseAdmin.storage.from("media").getPublicUrl(filePath);
        pdf_url = publicUrl.publicUrl;
    }

    const { error: insertError } = await supabaseAdmin.from("magazines").insert({
        title,
        description,
        edition,
        cover_image_url,
        pdf_url,
        is_featured,
        published_at: new Date().toISOString()
    });

    if (insertError) return { error: `Failed to insert magazine: ${insertError.message}` };

    revalidatePath("/revistas", "layout");
    revalidatePath("/", "layout");
    return { success: true };
}
