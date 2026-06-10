# Base de datos (Supabase)

Proyecto: `elnarradormovil` (`fewwvcrfhdgnpfjyadev`). **La base es compartida
con la app móvil de El Narrador**: contiene tablas que el sitio web no usa
(bookmarks, fcm_tokens, analytics, anuario_*, etc.). No borrar ni alterar
tablas sin verificar ambos clientes.

## Tablas que usa el sitio web

### `news` — notas del sitio
La tabla principal. La lee todo el sitio público y la escribe el panel admin
(`src/app/admin/actions.ts`) y la migración de WordPress.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | text (PK) | UUID generado por defecto |
| `source` | text | `'supabase'` o `'wordpress'` (check constraint) |
| `title`, `summary`, `content` | text | `content` es HTML sanitizado |
| `image_url` | text | URL pública del bucket `media` o externa |
| `category_slug`, `category_name` | text | El slug debe existir en `categoryMap` de `src/app/[category]/page.tsx` |
| `author_name` | text | Texto libre (autofill desde `admin_users.display_name`) |
| `tags` | text[] | |
| `published_at`, `created_at` | timestamptz | El orden público usa `published_at` |
| `view_count` | int | Lo incrementa el RPC `increment_view_count` |
| `is_featured`, `is_breaking` | bool | Portada destacada / última hora |
| `status` | text | default `'published'` |

### `magazines` — revistas en PDF
| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid (PK) | |
| `title`, `description`, `edition` | text | |
| `cover_image_url`, `pdf_url` | text | URLs públicas del bucket `media` |
| `published_at`, `created_at` | timestamptz | |
| `is_featured` | bool | |
| `view_count`, `download_count` | int | |

### `categories`
Catálogo de categorías (10 filas). El sitio web también mantiene una copia en
código en `src/app/[category]/page.tsx`; si se agrega una categoría hay que
actualizar ambos lados.

### `admin_users` — control de acceso al panel
| Columna | Tipo | Notas |
|---|---|---|
| `email` | text (unique) | Se compara en minúsculas |
| `display_name` | text | Autofill del campo "Autor" |
| `role` | text | `owner` / `editor` / `writer` |

`src/app/admin/layout.tsx` y el `requireAdmin()` de
`src/app/admin/actions.ts` permiten el acceso si el usuario autenticado está
en esta tabla (o si coincide con el env `ADMIN_EMAIL`, fallback legado).

### `authors` y `news_authors`
Autores normalizados y su relación N:M con `news`. El sitio los lee con
`getAuthorsByNewsId()` (`src/lib/supabase/queries.ts`).

## Funciones RPC que usa el sitio

- `increment_view_count(news_id)` — contador de vistas de artículos, con
  fallback a update directo si falla.

## Storage

Bucket **`media`** (público): el admin sube imágenes a `news/...` y portadas y
PDFs a `magazines/...` usando el cliente service-role. Existe además un bucket
`magazines` legado con archivos antiguos.

## Seguridad (RLS)

- **Todas las tablas públicas tienen RLS habilitado** (verificado 2026-06).
- Las lecturas públicas del sitio usan la clave anon con políticas de SELECT.
- Las escrituras del admin usan `SUPABASE_SERVICE_ROLE_KEY` (salta RLS), por
  eso `requireAdmin()` en los server actions es obligatorio.

### Pendientes señalados por los advisors de Supabase

Hallazgos del linter de seguridad de Supabase que conviene revisar en el
dashboard (no se pueden arreglar desde este repo sin coordinar con la app
móvil):

1. **`upsert_news` y `send_push_notification` son `SECURITY DEFINER` y el rol
   `anon` puede ejecutarlas** vía `/rest/v1/rpc/...`. Si la app móvil no las
   llama sin sesión, revocar `EXECUTE` a `anon`.
2. Varias funciones sin `search_path` fijo (`is_admin`, `upsert_news`, etc.).
3. Protección de contraseñas filtradas (HaveIBeenPwned) desactivada en Auth.
4. El bucket público `magazines` permite listar todos los archivos.

Referencia: ejecutar el [Security Advisor](https://supabase.com/dashboard/project/fewwvcrfhdgnpfjyadev/advisors/security)
en el dashboard para ver el estado actual.
