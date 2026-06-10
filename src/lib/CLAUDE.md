# Claude Context: src/lib

## Purpose
- `src/lib/` contains the data-access layer and external integration code.
- This is the main place to inspect before changing queries, storage behavior, migration logic, or shared content types.

## Supabase Clients
- `src/lib/supabase/server.ts`
  - Creates the server-side Supabase client
  - Uses cookies for SSR/session-aware requests
- `src/lib/supabase/client.ts`
  - Creates the browser-side Supabase client
- `src/lib/supabase/admin.ts`
  - Creates the privileged service-role client
  - Used for uploads and privileged writes

## Data Models
- `src/lib/supabase/queries.ts`
  - Defines `NewsArticle`
  - Includes read helpers for latest, featured, breaking, category, by-id, search, categories, and most-viewed news
- `src/lib/supabase/magazines.ts`
  - Defines `Magazine`
  - Includes read helpers for list, by-id, and featured magazines

## Query Layer Notes
- `getLatestNews`, `getFeaturedNews`, `getBreakingNews`, `getNewsByCategory`, `getNewsById`, `searchNews`, `getCategories`, and `getMostViewed` all read from Supabase tables.
- `incrementViewCount` calls the `increment_view_count` RPC first.
- If that RPC fails, `incrementViewCount` falls back to a direct update on the `news` table.

## Admin And Storage Operations
- Admin write flows are implemented in `src/app/admin/actions.ts`, but they depend on the privileged client from `src/lib/supabase/admin.ts`.
- Uploads currently use the Supabase storage bucket named `media`.
- News uploads store images under `news/...`.
- Magazine uploads store cover images and PDFs under `magazines/...`.

## YouTube Integration
- `src/lib/youtube/config.ts`
  - `YOUTUBE_CHANNEL` (handle), optional `YOUTUBE_CHANNEL_ID` (UC..., skips handle resolution) and `YOUTUBE_CHANNEL_URL` constants (no env vars, same pattern as ads config)
  - With both channel values empty the homepage video section renders nothing
- `src/lib/youtube/feed.ts`
  - `getLatestVideos(limit)` resolves the channel id from the handle (cached 24h) and reads the channel's public RSS feed (no API key)
  - Returns `[]` on any failure so the homepage never breaks because of YouTube

## WordPress Migration Utilities
- `src/lib/wordpress/migrate.ts`
  - Fetches categories and posts from the WordPress REST API
  - Normalizes HTML/plain-text fields
  - Inserts imported records into Supabase
- `src/app/api/migrate/route.ts`
  - Is the route-level entrypoint that calls the migration utility

## Security And Secret Handling
- Document names of secrets only. Do not paste values.
- `SUPABASE_SERVICE_ROLE_KEY` must stay server-only.
- `MIGRATION_SECRET_KEY` protects the migration endpoint.
- `ADMIN_EMAIL` is used by `src/app/admin/layout.tsx` to restrict admin access.

## Environment Variables Used By This Layer
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `WORDPRESS_API_URL`
- `MIGRATION_SECRET_KEY`
- `ADMIN_EMAIL`

## Tables And Content Domains
- `news`
- `magazines`
- `categories`

## Read This Before Changing Data Logic
- `src/lib/supabase/queries.ts`
- `src/lib/supabase/magazines.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/admin.ts`
- `src/app/admin/actions.ts`
- `src/lib/wordpress/migrate.ts`
