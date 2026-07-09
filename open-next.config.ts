import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import { withRegionalCache } from "@opennextjs/cloudflare/overrides/incremental-cache/regional-cache";

export default {
	...defineCloudflareConfig({
		// Guarda el HTML generado por ISR (revalidate = 300) en R2, con una capa
		// regional en la Cache API para no pegarle a R2 en cada request.
		// Requiere el bucket del binding NEXT_INC_CACHE_R2_BUCKET (wrangler.toml):
		//   npx wrangler r2 bucket create elnarradorweb2-inc-cache
		incrementalCache: withRegionalCache(r2IncrementalCache, {
			mode: "long-lived",
		}),
		// Sirve las páginas cacheadas directamente desde el worker sin levantar
		// el servidor de Next.js: es lo que baja el CPU time a ~1-3ms por request.
		enableCacheInterception: true,
	}),
	// Use build:next to avoid recursion since "build" calls opennext
	buildCommand: "npm run build:next",
};
