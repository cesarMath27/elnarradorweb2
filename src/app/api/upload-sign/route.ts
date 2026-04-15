import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/upload-sign
 * Body: { path: string }
 *
 * Generates a Supabase signed upload URL so the browser can upload large
 * files (PDFs, images) directly to Supabase Storage without routing the
 * bytes through the Next.js server.
 *
 * Only authenticated admin users can call this endpoint.
 */
export async function POST(req: NextRequest) {
    // Verify the caller is an authenticated admin
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const path = body?.path as string | undefined;

    if (!path || typeof path !== "string" || path.trim() === "") {
        return NextResponse.json({ error: "Path inválido." }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin.storage
        .from("media")
        .createSignedUploadUrl(path);

    if (error || !data) {
        return NextResponse.json(
            { error: error?.message ?? "No se pudo generar la URL firmada." },
            { status: 500 }
        );
    }

    return NextResponse.json({ signedUrl: data.signedUrl, token: data.token, path: data.path });
}
