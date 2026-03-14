"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

type AdminSidebarProps = {
  displayName: string;
  logoutAction: () => Promise<void>;
};

export default function AdminSidebar({ displayName, logoutAction }: AdminSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile header bar */}
      <div className="admin-mobile-header">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="admin-hamburger"
          aria-label="Abrir menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {isOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <>
                <path d="M3 6h18M3 12h18M3 18h18" />
              </>
            )}
          </svg>
        </button>
        <div className="admin-mobile-brand">
          <Image
            src="/images/El Narrador logo sin fondo.png"
            alt="El Narrador"
            width={28}
            height={28}
            style={{ borderRadius: "4px" }}
          />
          <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>Panel Admin</span>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="admin-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isOpen ? "admin-sidebar-open" : ""}`}>
        <div className="admin-sidebar-brand">
          <Image
            src="/images/El Narrador logo sin fondo.png"
            alt="El Narrador"
            width={36}
            height={36}
            style={{ borderRadius: "6px", flexShrink: 0 }}
          />
          <div>
            <div style={{ fontWeight: "700", fontSize: "0.95rem" }}>El Narrador</div>
            <div style={{ fontSize: "0.72rem", color: "#9CA3AF" }}>Panel de Admin</div>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          <NavLink href="/admin" label="Dashboard" icon="dashboard" active={pathname === "/admin"} />
          <div className="admin-nav-section">Noticias</div>
          <NavLink href="/admin/notas" label="Todas las Notas" icon="notes" active={pathname === "/admin/notas"} />
          <NavLink href="/admin/notas/nueva" label="Nueva Nota" icon="edit" active={pathname === "/admin/notas/nueva"} />
          <div className="admin-nav-section">Revistas</div>
          <NavLink href="/admin/revistas/nueva" label="Nueva Revista" icon="magazine" active={pathname === "/admin/revistas/nueva"} />
          <div className="admin-nav-section">Herramientas</div>
          <NavLink href="/admin/migrate" label="Migracion WP" icon="migrate" active={pathname === "/admin/migrate"} />
          <div className="admin-nav-section">Usuarios</div>
          <NavLink href="/admin/usuarios" label="Gestion de Usuarios" icon="users" active={pathname === "/admin/usuarios"} />
        </nav>

        <div className="admin-sidebar-footer">
          {displayName && (
            <div style={{
              padding: "0 0.25rem 0.75rem",
              fontSize: "0.8rem",
              color: "#9CA3AF",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {displayName}
            </div>
          )}
          <form action={logoutAction}>
            <button
              type="submit"
              className="admin-logout-btn"
            >
              Cerrar sesion
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}

const icons: Record<string, React.ReactNode> = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  notes: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V9a2 2 0 012-2h2a2 2 0 012 2v9a2 2 0 01-2 2h-2z" />
    </svg>
  ),
  edit: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  magazine: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  ),
  migrate: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  users: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3-3.803a4 4 0 110-5.292" />
    </svg>
  ),
};

function NavLink({ href, label, icon, active }: { href: string; label: string; icon: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`admin-nav-link ${active ? "admin-nav-link-active" : ""}`}
    >
      <span className="admin-nav-icon">{icons[icon]}</span>
      {label}
    </Link>
  );
}
