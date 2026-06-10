# El Narrador de México — Sitio web

Sitio editorial de noticias construido con Next.js. Una sola aplicación sirve
el sitio público (noticias, revistas, búsqueda) y el panel de administración
en `/admin`.

- **Producción:** https://elnarradordemexico.com
- **Stack:** Next.js 15 (App Router) · React 18 · TypeScript · Tailwind CSS v4 · Supabase · Cloudflare (vía OpenNext)

## Requisitos

- Node.js 20+
- npm
- Acceso al proyecto de Supabase (URL y claves)

## Arranque local

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env.local
#    ...y rellenar los valores (ver comentarios dentro del archivo)

# 3. Levantar el servidor de desarrollo
npm run dev
```

El sitio queda en http://localhost:3000 y el panel en http://localhost:3000/admin.

## Scripts

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build para Cloudflare con OpenNext (el que se despliega) |
| `npm run build:next` | Build estándar de Next (verificación rápida de lint + tipos) |
| `npm run lint` | ESLint sobre `src/` |
| `npm run typecheck` | Verificación de tipos con `tsc --noEmit` |
| `npm run preview` | Build + preview local con Wrangler |
| `npm run deploy` | Build + deploy a Cloudflare Pages |

## Estructura del proyecto

```
src/
├── app/          # Rutas, layouts, metadata, server actions (App Router)
│   ├── admin/    # Panel de administración (protegido por Supabase Auth)
│   └── api/      # Route handlers (p.ej. /api/migrate)
├── components/   # UI reutilizable del sitio público (news, magazines, seo, ads, ui)
├── lib/          # Acceso a datos: clientes Supabase, queries, migración WordPress
└── middleware.ts # Propaga el pathname y refresca la sesión de Supabase
```

Las carpetas `deploy/`, `deploy-pages/`, `deploy_me/`, `.next/` y `.open-next/`
son salida generada — no se editan ni se commitean.

## Documentación

| Documento | Contenido |
|---|---|
| [`DEPLOYMENT.md`](./DEPLOYMENT.md) | Cómo desplegar a Cloudflare, secrets y troubleshooting |
| [`docs/DATABASE.md`](./docs/DATABASE.md) | Esquema de Supabase: tablas, storage, RLS |
| [`CLAUDE.md`](./CLAUDE.md) | Contexto general del proyecto (también útil para humanos) |
| `.env.example` | Variables de entorno requeridas y su propósito |

## Dominios de contenido

- **Noticias** (`news`): notas con categoría, autor, imagen destacada y flags de
  destacada/última hora. Se crean desde `/admin/notas/nueva`.
- **Revistas** (`magazines`): ediciones en PDF con portada. Se crean desde
  `/admin/revistas/nueva`.
- **Categorías**: fijas en código (`src/app/[category]/page.tsx`) y en la tabla
  `categories`.

La base de datos Supabase es compartida con la app móvil de El Narrador;
ver [`docs/DATABASE.md`](./docs/DATABASE.md) antes de tocar el esquema.
