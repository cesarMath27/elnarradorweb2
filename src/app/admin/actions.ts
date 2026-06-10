"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminUserByEmail } from "@/lib/supabase/admin-users";

type ActionResult = { error?: string; success?: boolean };

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB
const MAX_PDF_BYTES = 50 * 1024 * 1024; // 50 MB
const MAX_TITLE_LENGTH = 200;
const MAX_SUMMARY_LENGTH = 500;
// HTML grande casi siempre significa imágenes pegadas como base64 dentro del editor
const MAX_CONTENT_LENGTH = 2 * 1024 * 1024; // ~2 MB de HTML

// La extensión se deriva del MIME type para no confiar en el nombre del archivo
const ALLOWED_IMAGE_TYPES: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/avif": "avif",
};

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

/**
 * Verifies that the caller is an authenticated admin (admin_users table or
 * legacy ADMIN_EMAIL). The admin layout already guards the UI, but server
 * actions are public POST endpoints and must enforce auth themselves.
 */
async function requireAdmin(): Promise<{ error: string } | { email: string }> {
    const supabase = await createClient();
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user?.email) {
        return { error: "Tu sesión expiró. Recarga la página e inicia sesión de nuevo." };
    }

    const email = user.email.toLowerCase();
    const adminUser = await getAdminUserByEmail(email);
    if (!adminUser) {
        const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        if (!adminEmail || email !== adminEmail) {
            return { error: "Tu cuenta no tiene permisos para publicar contenido." };
        }
    }

    return { email };
}

function getString(formData: FormData, key: string): string {
    const value = formData.get(key);
    return typeof value === "string" ? value.trim() : "";
}

function validateImage(file: File): { ext: string } | { error: string } {
    const ext = ALLOWED_IMAGE_TYPES[file.type];
    if (!ext) {
        return { error: `Formato de imagen no permitido (${file.type || "desconocido"}). Usa JPG, PNG, WebP, GIF o AVIF.` };
    }
    if (file.size > MAX_IMAGE_BYTES) {
        const mb = (file.size / 1024 / 1024).toFixed(1);
        return { error: `La imagen pesa ${mb} MB y el máximo es 8 MB. Comprímela e inténtalo de nuevo.` };
    }
    return { ext };
}

// Backstop server-side: la sanitización principal ocurre en el cliente con
// DOMPurify, pero el action es un endpoint público y no puede confiar en eso.
function stripDangerousHtml(html: string): string {
    return html
        .replace(/<\s*(script|style|iframe|object|embed|form)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
        .replace(/<\s*(script|style|iframe|object|embed|form)[^>]*\/?>/gi, "")
        .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
        .replace(/(href|src)\s*=\s*(["']?)\s*javascript:[^"'\s>]*\2/gi, "");
}

export async function uploadNews(formData: FormData): Promise<ActionResult> {
    try {
        const auth = await requireAdmin();
        if ("error" in auth) return { error: auth.error };

        const title = getString(formData, "title");
        const summary = getString(formData, "summary");
        const content = getString(formData, "content");
        const category_name = getString(formData, "category_name");
        const category_slug = getString(formData, "category_slug").toLowerCase();
        const author_name = getString(formData, "author_name");
        const is_featured = formData.get("is_featured") === "on";
        const is_breaking = formData.get("is_breaking") === "on";

        if (!title) return { error: "El título es obligatorio." };
        if (title.length > MAX_TITLE_LENGTH) return { error: `El título supera los ${MAX_TITLE_LENGTH} caracteres.` };
        if (!summary) return { error: "El resumen es obligatorio." };
        if (summary.length > MAX_SUMMARY_LENGTH) return { error: `El resumen supera los ${MAX_SUMMARY_LENGTH} caracteres.` };
        if (!category_slug) return { error: "Selecciona una categoría." };
        if (!content.replace(/<[^>]*>/g, "").trim()) return { error: "El contenido de la nota está vacío." };
        if (content.length > MAX_CONTENT_LENGTH) {
            return { error: "El contenido es demasiado grande. Si pegaste imágenes dentro del texto, elimínalas y usa solo la imagen destacada." };
        }

        const supabaseAdmin = createAdminClient();
        const imageOption = getString(formData, "imageOption");
        let image_url = "";

        if (imageOption === "url") {
            image_url = getString(formData, "imageUrl");
        } else {
            const file = formData.get("imageFile");
            if (file instanceof File && file.size > 0) {
                const validation = validateImage(file);
                if ("error" in validation) return { error: validation.error };

                const fileName = `${Date.now()}-${generateSlug(title)}.${validation.ext}`;
                const filePath = `news/${fileName}`;

                const { error: uploadError } = await supabaseAdmin.storage
                    .from("media")
                    .upload(filePath, file);

                if (uploadError) return { error: `No se pudo subir la imagen: ${uploadError.message}` };

                const { data: publicUrl } = supabaseAdmin.storage.from("media").getPublicUrl(filePath);
                image_url = publicUrl.publicUrl;
            }
        }

        const { error: insertError } = await supabaseAdmin.from("news").insert({
            title,
            summary,
            content: stripDangerousHtml(content),
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

        if (insertError) return { error: `No se pudo guardar la nota: ${insertError.message}` };

        revalidatePath("/", "layout");
        return { success: true };
    } catch (err) {
        console.error("uploadNews failed:", err);
        const message = err instanceof Error ? err.message : "Error desconocido";
        return { error: `Ocurrió un error al publicar la nota: ${message}` };
    }
}

export async function uploadMagazine(formData: FormData): Promise<ActionResult> {
    try {
        const auth = await requireAdmin();
        if ("error" in auth) return { error: auth.error };

        const title = getString(formData, "title");
        const description = getString(formData, "description");
        const edition = getString(formData, "edition");
        const is_featured = formData.get("is_featured") === "on";

        if (!title) return { error: "El título es obligatorio." };
        if (title.length > MAX_TITLE_LENGTH) return { error: `El título supera los ${MAX_TITLE_LENGTH} caracteres.` };

        const coverFile = formData.get("coverImage");
        const pdfFile = formData.get("pdfFile");

        const supabaseAdmin = createAdminClient();
        let cover_image_url = "";
        let pdf_url = "";

        if (coverFile instanceof File && coverFile.size > 0) {
            const validation = validateImage(coverFile);
            if ("error" in validation) return { error: validation.error };

            const fileName = `${Date.now()}-cover-${generateSlug(title)}.${validation.ext}`;
            const filePath = `magazines/${fileName}`;
            const { error } = await supabaseAdmin.storage.from("media").upload(filePath, coverFile);
            if (error) return { error: `No se pudo subir la portada: ${error.message}` };
            const { data: publicUrl } = supabaseAdmin.storage.from("media").getPublicUrl(filePath);
            cover_image_url = publicUrl.publicUrl;
        }

        if (pdfFile instanceof File && pdfFile.size > 0) {
            if (pdfFile.type !== "application/pdf") {
                return { error: "El archivo de la revista debe ser un PDF." };
            }
            if (pdfFile.size > MAX_PDF_BYTES) {
                const mb = (pdfFile.size / 1024 / 1024).toFixed(0);
                return { error: `El PDF pesa ${mb} MB y el máximo es 50 MB.` };
            }
            const fileName = `${Date.now()}-pdf-${generateSlug(title)}.pdf`;
            const filePath = `magazines/${fileName}`;
            const { error } = await supabaseAdmin.storage.from("media").upload(filePath, pdfFile);
            if (error) return { error: `No se pudo subir el PDF: ${error.message}` };
            const { data: publicUrl } = supabaseAdmin.storage.from("media").getPublicUrl(filePath);
            pdf_url = publicUrl.publicUrl;
        }

        if (!pdf_url) return { error: "El PDF de la revista es obligatorio." };

        const { error: insertError } = await supabaseAdmin.from("magazines").insert({
            title,
            description,
            edition,
            cover_image_url,
            pdf_url,
            is_featured,
            published_at: new Date().toISOString()
        });

        if (insertError) return { error: `No se pudo guardar la revista: ${insertError.message}` };

        revalidatePath("/revistas", "layout");
        revalidatePath("/", "layout");
        return { success: true };
    } catch (err) {
        console.error("uploadMagazine failed:", err);
        const message = err instanceof Error ? err.message : "Error desconocido";
        return { error: `Ocurrió un error al publicar la revista: ${message}` };
    }
}
