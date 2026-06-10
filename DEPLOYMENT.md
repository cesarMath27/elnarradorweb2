# Despliegue a Cloudflare

El sitio se construye con [OpenNext para Cloudflare](https://opennext.js.org/cloudflare)
y se despliega a Cloudflare Pages con Wrangler. La configuración vive en
`wrangler.toml` y `open-next.config.ts`.

## Flujo normal

```bash
# Verificar antes de desplegar (lint + tipos + build de Next)
npm run build:next

# Probar localmente la salida real de Cloudflare
npm run preview

# Desplegar
npm run deploy
```

`npm run deploy` ejecuta el build de OpenNext (`.open-next/`) y luego
`wrangler pages deploy`. Necesitas estar autenticado con `npx wrangler login`
o tener `CLOUDFLARE_API_TOKEN` exportado.

## Variables de entorno en Cloudflare

`wrangler.toml` solo contiene la variable pública `NEXT_PUBLIC_SUPABASE_URL`.
El resto debe configurarse en el dashboard de Cloudflare
(**Pages > proyecto > Settings > Environment variables**) o con
`npx wrangler pages secret put <NOMBRE>`:

| Variable | Tipo | Notas |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Variable | Clave pública de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** | Salta RLS; solo servidor |
| `NEXT_PUBLIC_SITE_URL` | Variable | `https://elnarradordemexico.com` |
| `WORDPRESS_API_URL` | Variable | Solo si se usa la migración |
| `MIGRATION_SECRET_KEY` | **Secret** | Protege `POST /api/migrate` |
| `ADMIN_EMAIL` | Variable | Fallback de acceso al panel admin |

Importante: las variables `NEXT_PUBLIC_*` se inyectan en el **build**, así que
si cambias alguna hay que volver a ejecutar `npm run deploy` (no basta con
cambiarla en el dashboard).

## Caché e ISR

Las páginas públicas exportan `revalidate = 300` (5 minutos) y los uploads del
admin llaman a `revalidatePath()`. En `open-next.config.ts` el incremental
cache de R2 está **deshabilitado** (comentado): cada request se renderiza
fresco en el worker, por lo que el contenido nuevo aparece de inmediato a
costa de algo más de carga sobre Supabase. Si el tráfico crece, habilitar el
R2 incremental cache siguiendo
[la guía de OpenNext](https://opennext.js.org/cloudflare/caching).

## Troubleshooting

- **El build falla con errores de tipos o lint**: es intencional; el proyecto
  ya no oculta errores (`next.config.ts` no usa `ignoreBuildErrors`). Corre
  `npm run typecheck` y `npm run lint` para ver el detalle.
- **El build falla al prerender categorías**: las páginas de categoría
  consultan Supabase durante el build. Verifica que `NEXT_PUBLIC_SUPABASE_URL`
  y `NEXT_PUBLIC_SUPABASE_ANON_KEY` estén disponibles en el entorno de build.
- **Una nota publicada no aparece en el sitio**: el insert va directo a la
  tabla `news`; verifica primero en `/admin/notas` que exista. Si existe pero
  no se ve en la portada, es un tema de caché del navegador o del CDN.
- **Error 413 / fallos al subir archivos grandes**: el límite de body de los
  server actions es 50 MB (`next.config.ts`). Los formularios validan antes:
  imágenes hasta 8 MB y PDFs hasta 50 MB.
