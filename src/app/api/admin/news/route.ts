import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

function generateSlug(title: string) {
    return title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
}

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const formData = await request.formData();

    const title = formData.get("title") as string;
    const summary = formData.get("summary") as string;
    const content = formData.get("content") as string;
    const category_name = formData.get("category_name") as string;
    const category_slug = (formData.get("category_slug") as string).toLowerCase();
    const author_name = formData.get("author_name") as string;
    const is_featured = formData.get("is_featured") === "on";
    const is_breaking = formData.get("is_breaking") === "on";
    const imageOption = formData.get("imageOption") as string;

    const supabaseAdmin = createAdminClient();
    let image_url = "";

    if (imageOption === "url") {
        image_url = formData.get("imageUrl") as string;
    } else {
        const file = formData.get("imageFile") as File;
        if (file && file.size > 0) {
            const fileExt = file.name.split(".").pop();
            const fileName = `${Date.now()}-${generateSlug(title)}.${fileExt}`;
            const filePath = `news/${fileName}`;
            const { error: uploadError } = await supabaseAdmin.storage
                .from("media")
                .upload(filePath, file);
            if (uploadError) {
                return NextResponse.json({ error: `Error al subir imagen: ${uploadError.message}` });
            }
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
        published_at: new Date().toISOString(),
    });

    if (insertError) {
        return NextResponse.json({ error: `Error al guardar: ${insertError.message}` });
    }

    revalidatePath("/", "layout");
    return NextResponse.json({ success: true });
}
