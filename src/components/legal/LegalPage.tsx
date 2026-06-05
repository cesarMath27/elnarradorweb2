import type { ReactNode } from "react";

interface LegalPageProps {
  /** Título principal de la página (p. ej. "Política de Privacidad"). */
  title: string;
  /** Fecha de última actualización en texto legible. */
  updatedAt: string;
  /** Cuerpo del documento legal. */
  children: ReactNode;
}

/**
 * Maqueta compartida para páginas legales (privacidad, términos, etc.).
 *
 * Reutiliza los estilos tipográficos de `.article-content` definidos en
 * `globals.css`, por lo que los encabezados (`h2`/`h3`), párrafos, listas y
 * enlaces dentro de `children` ya quedan formateados de forma consistente.
 */
export default function LegalPage({ title, updatedAt, children }: LegalPageProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gold rounded-full" />
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
            {title}
          </h1>
        </div>
        <p className="text-muted-light text-sm mt-3">
          Última actualización: {updatedAt}
        </p>
        <div className="h-px bg-border mt-6" />
      </div>

      <article className="article-content text-foreground/90">{children}</article>
    </div>
  );
}
