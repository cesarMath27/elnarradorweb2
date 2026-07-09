import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
    // Forward the pathname as a request header so Server Components can read it
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-invoke-path", request.nextUrl.pathname);

    let supabaseResponse = NextResponse.next({
        request: { headers: requestHeaders },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                    // Re-create response preserving the request headers
                    supabaseResponse = NextResponse.next({
                        request: { headers: requestHeaders },
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // IMPORTANT: Refreshes the session token if expired.
    // Auth protection is handled in the admin layout server component.
    await supabase.auth.getUser();

    return supabaseResponse;
}

// Solo corre en /admin: es el único lugar que necesita refrescar la sesión
// de Supabase y leer x-invoke-path. Correrlo en todo el sitio creaba un
// cliente Supabase y validaba el JWT en cada request pública (CPU de más).
export const config = {
    matcher: ["/admin/:path*"],
};
