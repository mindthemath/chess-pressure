/* Chess Pressure service worker — opt-in offline / instant repeat-visit cache.
 *
 * Only registered when window.CHESS_PWA is true (gated by the ENABLE_CHESS_PWA
 * build flag). When active, repeat visits are served entirely from cache and
 * never hit the server — which also means returning visitors won't appear in
 * the Fly logs, so this is off by default.
 *
 * Bump CACHE on every deploy so clients pick up new assets.
 */
const CACHE = "chess-pressure-v30";

// Same-origin app shell. Cached by canonical path; the fetch handler matches
// with ignoreSearch so cache-busting query strings (?v=NN) still hit.
const CORE = [
  "/",
  "/index.html",
  "/app.js",
  "/engine.js",
  "/chess.min.js",
  "/gif.js",
  "/gif.worker.js",
  "/style.css",
  "/games.json",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const sameOrigin = new URL(req.url).origin === self.location.origin;

  // Navigations always resolve to the cached app shell (offline-first SPA).
  if (req.mode === "navigate") {
    event.respondWith(
      caches.match("/index.html", { ignoreSearch: true }).then((r) => r || fetch(req)),
    );
    return;
  }

  // Everything else: cache-first, then network (and cache for next time).
  event.respondWith(
    caches.match(req, { ignoreSearch: sameOrigin }).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((resp) => {
          if (resp && (resp.ok || resp.type === "opaque")) {
            const copy = resp.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return resp;
        })
        .catch(() => cached);
    }),
  );
});
