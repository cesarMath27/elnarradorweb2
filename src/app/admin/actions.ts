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
    const supabaseAdmin = createAdminClient();

    const title = formData.get("title") as string;
    const summary = formData.get("summary") as string;
    const content = formData.get("content") as string;
    const category_name = formData.get("category_name") as string;
    const category_slug = (formData.get("category_slug") as string).toLowerCase();
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

            if (uploadError) return { error: `Image upload failed: ${uploadError.message}` };

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

    if (insertError) return { error: `Failed to insert news: ${insertError.message}` };

    revalidatePath("/", "layout");
    return { success: true };
}

export async function deleteNews(id: string) {
    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin.from("news").delete().eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/", "layout");
    return { success: true };
}

export async function updateNews(id: string, formData: FormData) {
    const supabaseAdmin = createAdminClient();

    const title = formData.get("title") as string;
    const summary = formData.get("summary") as string;
    const content = formData.get("content") as string;
    const category_name = formData.get("category_name") as string;
    const category_slug = (formData.get("category_slug") as string).toLowerCase();
    const author_name = formData.get("author_name") as string;
    const is_featured = formData.get("is_featured") === "on";
    const is_breaking = formData.get("is_breaking") === "on";

    const imageOption = formData.get("imageOption") as string;
    let image_url = (formData.get("currentImageUrl") as string) || "";

    if (imageOption === "url") {
        image_url = formData.get("imageUrl") as string;
    } else if (imageOption === "upload") {
        const file = formData.get("imageFile") as File;
        if (file && file.size > 0) {
            const fileExt = file.name.split(".").pop();
            const fileName = `${Date.now()}-${generateSlug(title)}.${fileExt}`;
            const filePath = `news/${fileName}`;
            const { error: uploadError } = await supabaseAdmin.storage
                .from("media")
                .upload(filePath, file);
            if (uploadError) return { error: `Image upload failed: ${uploadError.message}` };
            const { data: publicUrl } = supabaseAdmin.storage.from("media").getPublicUrl(filePath);
            image_url = publicUrl.publicUrl;
        }
    }

    const { error: updateError } = await supabaseAdmin
        .from("news")
        .update({
            title,
            summary,
            content,
            category_slug,
            category_name,
            author_name,
            image_url,
            is_featured,
            is_breaking,
        })
        .eq("id", id);

    if (updateError) return { error: `Failed to update news: ${updateError.message}` };

    revalidatePath("/", "layout");
    revalidatePath(`/articulo/${id}`, "page");
    return { success: true };
}

/**
 * saveMagazine — inserts a magazine record after the client has already
 * uploaded the files directly to Supabase Storage via signed URLs.
 * No file bytes ever pass through this server action.
 */
export async function saveMagazine(data: {
    title: string;
    description: string;
    edition: string;
    is_featured: boolean;
    cover_image_url: string;
    pdf_url: string;
}) {
    if (!data.title?.trim()) return { error: "El título es obligatorio." };
    if (!data.edition?.trim()) return { error: "La edición es obligatoria." };
    if (!data.pdf_url?.trim()) return { error: "No se recibió la URL del PDF." };

    const supabaseAdmin = createAdminClient();
    const { error: insertError } = await supabaseAdmin.from("magazines").insert({
        title: data.title,
        description: data.description,
        edition: data.edition,
        cover_image_url: data.cover_image_url,
        pdf_url: data.pdf_url,
        is_featured: data.is_featured,
        published_at: new Date().toISOString(),
    });

    if (insertError) return { error: `Error al guardar la revista: ${insertError.message}` };

    revalidatePath("/revistas", "layout");
    revalidatePath("/", "layout");
    return { success: true };
}

export async function uploadMagazine(formData: FormData) {
    const supabaseAdmin = createAdminClient();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const edition = formData.get("edition") as string;
    const is_featured = formData.get("is_featured") === "on";

    if (!title?.trim()) return { error: "El título es obligatorio." };
    if (!edition?.trim()) return { error: "La edición es obligatoria." };

    const coverFile = formData.get("coverImage") as File;
    const pdfFile = formData.get("pdfFile") as File;

    // PDF is required
    if (!pdfFile || pdfFile.size === 0) {
        return { error: "Debes seleccionar un archivo PDF." };
    }

    let cover_image_url = "";
    let pdf_url = "";

    // Upload cover image (optional)
    if (coverFile && coverFile.size > 0) {
        const fileExt = coverFile.name.split(".").pop();
        const fileName = `${Date.now()}-cover-${generateSlug(title)}.${fileExt}`;
        const filePath = `magazines/${fileName}`;
        const { error } = await supabaseAdmin.storage
            .from("media")
            .upload(filePath, coverFile, { contentType: coverFile.type || "image/jpeg" });
        if (error) return { error: `Error al subir la portada: ${error.message}` };
        const { data: publicUrl } = supabaseAdmin.storage.from("media").getPublicUrl(filePath);
        cover_image_url = publicUrl.publicUrl;
    }

    // Upload PDF (required)
    const pdfExt = pdfFile.name.split(".").pop();
    const pdfFileName = `${Date.now()}-pdf-${generateSlug(title)}.${pdfExt}`;
    const pdfFilePath = `magazines/${pdfFileName}`;
    const { error: pdfError } = await supabaseAdmin.storage
        .from("media")
        .upload(pdfFilePath, pdfFile, { contentType: "application/pdf" });
    if (pdfError) return { error: `Error al subir el PDF: ${pdfError.message}` };
    const { data: pdfPublicUrl } = supabaseAdmin.storage.from("media").getPublicUrl(pdfFilePath);
    pdf_url = pdfPublicUrl.publicUrl;

    if (!pdf_url) return { error: "No se pudo obtener la URL del PDF." };

    const { error: insertError } = await supabaseAdmin.from("magazines").insert({
        title,
        description,
        edition,
        cover_image_url,
        pdf_url,
        is_featured,
        published_at: new Date().toISOString(),
    });

    if (insertError) return { error: `Error al guardar la revista: ${insertError.message}` };

    revalidatePath("/revistas", "layout");
    revalidatePath("/", "layout");
    return { success: true };
}
