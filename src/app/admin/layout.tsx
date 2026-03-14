import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminUserByEmail } from "@/lib/supabase/admin-users";
import { logoutAdmin } from "./actions";
import AdminSidebar from "./AdminSidebar";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const headersList = await headers();
    const currentPath = headersList.get("x-invoke-path") || "";
    const isLoginPage = currentPath === "/admin/login";

    let adminDisplayName = "";

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

        const userEmail = user.email?.toLowerCase() ?? "";

        // Check admin_users table first
        const adminUser = await getAdminUserByEmail(userEmail);

        if (adminUser) {
            adminDisplayName = adminUser.display_name;
        } else {
            // Fallback: check legacy ADMIN_EMAIL env var
            const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
            if (!adminEmail || userEmail !== adminEmail) {
                redirect("/admin/login");
            }
            adminDisplayName = user.email ?? "Admin";
        }
    }

    // Render login page without admin chrome
    if (isLoginPage) {
        return <>{children}</>;
    }

    // Render full admin panel layout
    return (
        <div className="admin-layout">
            <AdminSidebar displayName={adminDisplayName} logoutAction={logoutAdmin} />
            <main className="admin-main">
                {children}
            </main>
        </div>
    );
}
