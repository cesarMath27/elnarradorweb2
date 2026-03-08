
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

type NavItem = { href: string; label: string };
type NavSection = { title: string; items: NavItem[] };

const navSections: NavSection[] = [
    {
        title: "General",
        items: [{ href: "/admin", label: "Dashboard" }],
    },
    {
        title: "Noticias",
        items: [
            { href: "/admin/notas", label: "Todas las notas" },
            { href: "/admin/notas/nueva", label: "Nueva nota" },
        ],
    },
    {
        title: "Revistas",
        items: [{ href: "/admin/revistas/nueva", label: "Nueva revista" }],
    },
    {
        title: "Herramientas",
        items: [{ href: "/admin/migrate", label: "Migracion WP" }],
    },
];

function isActivePath(pathname: string, href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(href + "/");
}

function SidebarContent({
    pathname,
    onNavigate,
}: {
    pathname: string;
    onNavigate?: () => void;
}) {
    return (
        <>
            <div className="border-b border-gray-800 px-5 py-6">
                <div className="mb-1 text-lg font-bold text-white">El Narrador</div>
                <div className="text-xs text-gray-400">Panel de administracion</div>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4">
                {navSections.map((section) => (
                    <div key={section.title} className="mb-4">
                        <p className="px-3 pb-2 text-[11px] uppercase tracking-wide text-gray-500">{section.title}</p>
                        <div className="space-y-1">
                            {section.items.map((item) => {
                                const active = isActivePath(pathname, item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={onNavigate}
                                        className={
                                            "block rounded-lg px-3 py-2 text-sm transition-colors " +
                                            (active ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white")
                                        }
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>
        </>
    );
}

export default function AdminShell({
    children,
    logoutAction,
}: {
    children: React.ReactNode;
    logoutAction: (formData: FormData) => Promise<void>;
}) {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pageTitle = useMemo(() => {
        const found = navSections.flatMap((s) => s.items).find((item) => isActivePath(pathname, item.href));
        return found?.label ?? "Admin";
    }, [pathname]);
    return (
        <div className="min-h-screen bg-gray-100">
            <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur md:hidden">
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                    <div>
                        <p className="text-sm font-semibold text-gray-900">{pageTitle}</p>
                        <p className="text-xs text-gray-500">El Narrador</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen((v) => !v)}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700"
                    >
                        {mobileMenuOpen ? "Cerrar" : "Menu"}
                    </button>
                </div>
            </header>

            <div className="flex min-h-screen md:min-h-0">
                <aside className="hidden w-64 shrink-0 bg-gray-900 text-white md:flex md:flex-col">
                    <SidebarContent pathname={pathname} />
                    <div className="border-t border-gray-800 p-4">
                        <form action={logoutAction}>
                            <button
                                type="submit"
                                className="w-full rounded-lg border border-gray-700 px-3 py-2 text-left text-sm text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
                            >
                                Cerrar sesion
                            </button>
                        </form>
                    </div>
                </aside>

                {mobileMenuOpen && (
                    <div className="fixed inset-0 z-40 md:hidden">
                        <button
                            type="button"
                            aria-label="Cerrar menu"
                            className="absolute inset-0 bg-black/40"
                            onClick={() => setMobileMenuOpen(false)}
                        />
                        <aside className="relative h-full w-[88vw] max-w-xs bg-gray-900 text-white shadow-xl">
                            <div className="flex h-full flex-col">
                                <SidebarContent pathname={pathname} onNavigate={() => setMobileMenuOpen(false)} />
                                <div className="border-t border-gray-800 p-4">
                                    <form action={logoutAction}>
                                        <button
                                            type="submit"
                                            className="w-full rounded-lg border border-gray-700 px-3 py-2 text-left text-sm text-gray-300"
                                        >
                                            Cerrar sesion
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </aside>
                    </div>
                )}

                <main className="w-full min-w-0 flex-1 p-4 md:p-8">{children}</main>
            </div>
        </div>
    );
}
