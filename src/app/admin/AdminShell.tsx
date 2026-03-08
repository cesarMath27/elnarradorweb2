"use client";

import { useState } from "react";
import Link from "next/link";

const NAV_SECTIONS = [
    {
        heading: "Noticias",
        links: [
            { href: "/admin/notas", label: "Todas las Notas", icon: "📰" },
            { href: "/admin/notas/nueva", label: "Nueva Nota", icon: "✏️" },
        ],
    },
    {
        heading: "Revistas",
        links: [
            { href: "/admin/revistas/nueva", label: "Nueva Revista", icon: "📖" },
        ],
    },
    {
        heading: "Herramientas",
        links: [
            { href: "/admin/migrate", label: "Migración WP", icon: "🔄" },
        ],
    },
];

export default function AdminShell({
    children,
    logoutAction,
}: {
    children: React.ReactNode;
    logoutAction: () => Promise<void>;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-gray-100" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            {/* Mobile header */}
            <header className="md:hidden flex items-center justify-between bg-gray-900 text-white px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#D4A517] rounded-md flex items-center justify-center font-bold text-sm">
                        N
                    </div>
                    <span className="font-bold text-sm">El Narrador</span>
                </div>
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                    aria-label="Menú"
                >
                    {sidebarOpen ? (
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M3 12h18M3 6h18M3 18h18" />
                        </svg>
                    )}
                </button>
            </header>

            {/* Overlay for mobile sidebar */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-40 w-60 bg-gray-900 text-white flex flex-col
                    transform transition-transform duration-200 ease-in-out
                    md:relative md:translate-x-0 md:shrink-0
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                `}
            >
                {/* Logo - hidden on mobile (shown in header instead) */}
                <div className="hidden md:flex items-center gap-3 px-5 py-5 border-b border-gray-800">
                    <div className="w-9 h-9 bg-[#D4A517] rounded-md flex items-center justify-center font-bold text-base shrink-0">
                        N
                    </div>
                    <div>
                        <div className="font-bold text-[0.95rem]">El Narrador</div>
                        <div className="text-[0.72rem] text-gray-400">Panel de Admin</div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
                    <Link
                        href="/admin"
                        onClick={() => setSidebarOpen(false)}
                        className="block px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white text-sm transition-colors"
                    >
                        📊 Dashboard
                    </Link>

                    {NAV_SECTIONS.map((section) => (
                        <div key={section.heading}>
                            <div className="px-3 pt-4 pb-1 text-[0.7rem] text-gray-500 uppercase tracking-wider">
                                {section.heading}
                            </div>
                            {section.links.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className="block px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white text-sm transition-colors"
                                >
                                    {link.icon} {link.label}
                                </Link>
                            ))}
                        </div>
                    ))}
                </nav>

                {/* Logout */}
                <div className="p-3 border-t border-gray-800">
                    <form action={logoutAction}>
                        <button
                            type="submit"
                            className="w-full text-left px-3 py-2 rounded-lg border border-gray-700 text-gray-400 text-sm hover:bg-gray-800 hover:text-white transition-colors cursor-pointer"
                        >
                            🚪 Cerrar sesión
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto min-h-0">
                {children}
            </main>
        </div>
    );
}
