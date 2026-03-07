import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logoutAdmin } from "./actions";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const headersList = await headers();
    const currentPath = headersList.get("x-invoke-path") || "";
    const isLoginPage = currentPath === "/admin/login";

    // Only protect non-login routes
    if (!isLoginPage) {
        const supabase = await createClient();
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser();

        // Debug log – visible in the terminal running `npm run dev`
        console.log("[Admin Layout] path:", currentPath, "| user:", user?.email ?? "null", "| error:", error?.message ?? "none");

        if (error || !user) {
            console.log("[Admin Layout] No user found, redirecting to login");
            redirect("/admin/login");
        }

        const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const userEmail = user.email?.toLowerCase();

        console.log("[Admin Layout] adminEmail:", adminEmail, "| userEmail:", userEmail, "| match:", userEmail === adminEmail);

        if (adminEmail && userEmail !== adminEmail) {
            console.log("[Admin Layout] Email mismatch, redirecting to login");
            redirect("/admin/login");
        }
    }

    // Render login page without admin chrome
    if (isLoginPage) {
        return <>{children}</>;
    }

    // Render full admin panel layout
    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "row",
                fontFamily: "'Inter', system-ui, sans-serif",
                background: "#F3F4F6",
            }}
        >
            {/* Sidebar */}
            <aside
                style={{
                    width: "240px",
                    minHeight: "100vh",
                    background: "#111827",
                    color: "white",
                    display: "flex",
                    flexDirection: "column",
                    flexShrink: 0,
                }}
            >
                <div
                    style={{
                        padding: "1.5rem 1.25rem",
                        borderBottom: "1px solid #1F2937",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                    }}
                >
                    <div
                        style={{
                            width: "36px",
                            height: "36px",
                            background: "#D4A517",
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "bold",
                            fontSize: "1.1rem",
                            flexShrink: 0,
                        }}
                    >
                        N
                    </div>
                    <div>
                        <div style={{ fontWeight: "700", fontSize: "0.95rem" }}>El Narrador</div>
                        <div style={{ fontSize: "0.72rem", color: "#9CA3AF" }}>Panel de Admin</div>
                    </div>
                </div>

                <nav style={{ flex: 1, padding: "1rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <NavLink href="/admin" label="📊 Dashboard" />
                    <div style={{ padding: "0.75rem 0.75rem 0.25rem", fontSize: "0.7rem", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Noticias
                    </div>
                    <NavLink href="/admin/notas" label="📰 Todas las Notas" />
                    <NavLink href="/admin/notas/nueva" label="✏️ Nueva Nota" />
                    <div style={{ padding: "0.75rem 0.75rem 0.25rem", fontSize: "0.7rem", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Revistas
                    </div>
                    <NavLink href="/admin/revistas/nueva" label="📖 Nueva Revista" />
                    <div style={{ padding: "0.75rem 0.75rem 0.25rem", fontSize: "0.7rem", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Herramientas
                    </div>
                    <NavLink href="/admin/migrate" label="🔄 Migración WP" />
                </nav>

                <div style={{ padding: "1rem", borderTop: "1px solid #1F2937" }}>
                    <form action={logoutAdmin}>
                        <button
                            type="submit"
                            style={{
                                width: "100%",
                                padding: "0.6rem 1rem",
                                background: "transparent",
                                border: "1px solid #374151",
                                borderRadius: "6px",
                                color: "#9CA3AF",
                                fontSize: "0.85rem",
                                cursor: "pointer",
                                textAlign: "left",
                            }}
                        >
                            🚪 Cerrar sesión
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main content */}
            <main style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
                {children}
            </main>
        </div>
    );
}

function NavLink({ href, label }: { href: string; label: string }) {
    return (
        <Link
            href={href}
            style={{
                display: "block",
                padding: "0.6rem 0.75rem",
                borderRadius: "6px",
                color: "#D1D5DB",
                textDecoration: "none",
                fontSize: "0.875rem",
                transition: "background 0.15s",
            }}
            onMouseEnter={undefined}
        >
            {label}
        </Link>
    );
}
