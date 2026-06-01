# Claude Context: narrador-web

## Project Overview
- Editorial website for `El Narrador de Mexico`.
- Single `Next.js` app that serves both the public news site and the `/admin` panel.
- Main content domains are `news`, `magazines`, and `categories`.
- Data is stored in Supabase. There is also a WordPress migration path for importing legacy content.

## Tech Stack
- `Next.js 15.5.x` App Router
- `React 18`
- `TypeScript`
- `Tailwind CSS v4`
- `Supabase`
- `OpenNext` targeting `Cloudflare`

## Runtime And Deployment
- Local dev entrypoint: `npm run dev`
- Build for Cloudflare/OpenNext: `npm run build`
- Plain Next build: `npm run build:next`
- Preview Pages output locally: `npm run preview`
- Deploy command: `npm run deploy`
- Cloudflare config lives in `wrangler.toml` and `open-next.config.ts`

## Source Of Truth
- Primary source folders:
  - `src/`
  - `public/`
  - `package.json`
  - `next.config.ts`
  - `open-next.config.ts`
  - `wrangler.toml`
- Generated or deployment output. Do not rely on these as authoritative source:
  - `.next/`
  - `.open-next/`
  - `deploy/`
  - `deploy-pages/`
  - `deploy_me/`
  - `out/`
  - `node_modules/`

## High-Level Folder Map
- `src/app/`: routes, layouts, metadata, route handlers, server actions
- `src/components/`: reusable public UI and SEO helpers
- `src/lib/`: Supabase access and WordPress migration logic
- `src/middleware.ts`: request header propagation and auth session refresh
- `public/`: static assets and hosting headers

## Environment Variables Actually Used
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `WORDPRESS_API_URL`
- `MIGRATION_SECRET_KEY`
- `ADMIN_EMAIL`

Do not copy secrets into documentation. Only document names and purpose.

## Monetization (Google AdSense)
- The AdSense loader script lives in `src/components/ads/AdSenseScript.tsx` and is mounted only on public pages from `src/app/layout.tsx`.
- Shared config (publisher ID and manual ad slot IDs) lives in `src/lib/ads/config.ts`. It uses no environment variables, so it works in production with no extra setup.
- Reusable manual ad blocks use `src/components/ads/AdUnit.tsx`. An `<AdUnit />` with an empty slot renders nothing, so no empty ad boxes appear and Auto Ads keep working.
- `public/ads.txt` authorizes Google to serve ads for this publisher.
- The publisher ID is also emitted as a `google-adsense-account` meta tag for site verification.

## Main Routes And Responsibilities
- `/`: homepage with latest news, featured news, most viewed news, and magazine teaser content
- `/[category]`: category listing
- `/articulo/[id]`: article detail page with dynamic metadata and JSON-LD
- `/buscar`: search results page
- `/revistas`: magazine listing
- `/revistas/[id]`: magazine detail and PDF viewer
- `/admin`: admin dashboard
- `/admin/login`: login page
- `/admin/notas`: news management list
- `/admin/notas/nueva`: create a news entry
- `/admin/revistas/nueva`: create a magazine entry
- `/admin/migrate`: trigger WordPress migration flow
- `/api/migrate`: migration API endpoint guarded by `MIGRATION_SECRET_KEY`

## Data Sources
- Supabase is the primary live data source.
- WordPress import code lives in `src/lib/wordpress/migrate.ts`.
- Migration endpoint lives in `src/app/api/migrate/route.ts`.
- Public article and magazine reads are handled through `src/lib/supabase/queries.ts` and `src/lib/supabase/magazines.ts`.

## Cross-Cutting Runtime Behavior
- `src/middleware.ts` forwards the current pathname through `x-invoke-path`.
- `src/middleware.ts` also refreshes the Supabase auth session on each matching request.
- `src/app/layout.tsx` uses `x-invoke-path` to avoid rendering the public navbar/footer for `/admin` routes.
- `src/app/admin/layout.tsx` enforces auth and optional `ADMIN_EMAIL` matching.

## Important Warnings
- `next.config.ts` currently sets `eslint.ignoreDuringBuilds = true`.
- `next.config.ts` currently sets `typescript.ignoreBuildErrors = true`.
- Treat successful builds cautiously because type and lint failures may be hidden.

## Safe Change Guidance
- Put route and page behavior in `src/app/`.
- Put reusable rendering logic in `src/components/`.
- Put data access and external integrations in `src/lib/`.
- Avoid editing generated output folders.
- Prefer reading `src/app/layout.tsx`, `src/middleware.ts`, and `src/lib/supabase/*` before changing behavior that spans public and admin flows.

## Suggested Reading Order
1. `package.json`
2. `next.config.ts`
3. `src/middleware.ts`
4. `src/app/layout.tsx`
5. `src/app/CLAUDE.md`
6. `src/lib/CLAUDE.md`
7. `src/components/CLAUDE.md`
8. `public/CLAUDE.md`
