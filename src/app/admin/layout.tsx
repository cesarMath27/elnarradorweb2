import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminShell from "./AdminShell";
import { logoutAdmin } from "./actions";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const headersList = await headers();
    const currentPath = headersList.get("x-invoke-path") || "";
    const isLoginPage = currentPath === "/admin/login";

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

    if (isLoginPage) {
        return <>{children}</>;
    }

    return <AdminShell logoutAction={logoutAdmin}>{children}</AdminShell>;
}
