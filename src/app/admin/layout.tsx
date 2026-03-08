import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logoutAdmin } from "./actions";
import AdminShell from "./AdminShell";

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

        if (error || !user) {
            redirect("/admin/login");
        }

        const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const userEmail = user.email?.toLowerCase();

        if (adminEmail && userEmail !== adminEmail) {
            redirect("/admin/login");
        }
    }

    // Render login page without admin chrome
    if (isLoginPage) {
        return <>{children}</>;
    }

    // Render full admin panel layout
    return (
        <AdminShell logoutAction={logoutAdmin}>
            {children}
        </AdminShell>
    );
}
