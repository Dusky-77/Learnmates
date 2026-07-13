// asset-worker/src/index.ts
//
// Serves files from the private "learnmates-cdn" R2 bucket at
// https://assets.learnmates.org/<path>, replacing the old public-bucket setup.
//
// "Basic protection" (no user-auth system exists yet):
//   1. Origin/Referer must match an allowed frontend domain
//   2. A shared secret header (X-Asset-Key) must match a Worker secret
// Neither stops a determined attacker who extracts the key from your JS
// bundle — they only deter casual hotlinking/scraping. Swap step 2 for a
// real per-user token check once you have an auth system.
//
// Caching:
//   - Cache-Control header -> caches in the requesting browser
//   - Cloudflare edge Cache API -> caches across ALL users at the edge,
//     which is what actually reduces R2 Class B (read) operations

export interface Env {
  TOPICALS_BUCKET: R2Bucket;
  ASSET_SHARED_KEY: string; // set via `wrangler secret put ASSET_SHARED_KEY`
  ALLOWED_ORIGINS: string;  // comma-separated, set in wrangler.toml [vars]
}

// Tune to how often files actually change. These are static question/markscheme
// files that essentially never change once uploaded, so cache aggressively.
const CACHE_CONTROL = 'public, max-age=86400, s-maxage=604800, immutable';

function isOriginAllowed(request: Request, allowedOrigins: string[]): boolean {
  const origin = request.headers.get('Origin');
  const referer = request.headers.get('Referer');
  const candidate = origin || referer || '';
  if (!candidate) return false;
  return allowedOrigins.some((allowed) => candidate.startsWith(allowed));
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const url = new URL(request.url);
    const key = decodeURIComponent(url.pathname.replace(/^\/+/, ''));
    if (!key) {
      return new Response('Not Found', { status: 404 });
    }

    const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean);
    const providedKey = request.headers.get('X-Asset-Key');

    if (!isOriginAllowed(request, allowedOrigins) || providedKey !== env.ASSET_SHARED_KEY) {
      return new Response('Forbidden', { status: 403 });
    }

    // Edge cache check — a hit here never touches R2 at all, for any user.
    const cache = caches.default;
    const cacheKey = new Request(url.toString(), { method: 'GET' });
    const cached = await cache.match(cacheKey);
    if (cached) {
      return cached;
    }

    const object = await env.TOPICALS_BUCKET.get(key);
    if (!object) {
      return new Response('Not Found', { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers); // sets Content-Type etc. from upload metadata
    headers.set('etag', object.httpEtag);
    headers.set('Cache-Control', CACHE_CONTROL);
    headers.set('Access-Control-Allow-Origin', request.headers.get('Origin') || '*');
    headers.set('Vary', 'Origin');

    const response = new Response(object.body, { headers, status: 200 });

    // Store a copy in the edge cache for the next request (any user, any region
    // that hits this cache tier). Doesn't block returning the response.
    ctx.waitUntil(cache.put(cacheKey, response.clone()));

    return response;
  },
};
