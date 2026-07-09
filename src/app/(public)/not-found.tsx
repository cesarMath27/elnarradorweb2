import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <h1 className="font-heading text-6xl font-bold text-gold mb-4">404</h1>
      <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
        Página no encontrada
      </h2>
      <p className="text-muted mb-8">
        La página que buscas no existe o ha sido movida.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-gold text-white px-6 py-3 rounded-lg font-medium hover:bg-gold-dark transition-colors duration-200 cursor-pointer"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
          />
        </svg>
        Volver al inicio
      </Link>
    </div>
  );
}
