const CACHE = "soloq-challenge-v2";
const PRECACHE = ["/", "/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

function offlineResponse() {
  return new Response("Hors ligne — réessaie quand tu es connecté.", {
    status: 503,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  // Pages Next.js : toujours le réseau (évite cache HTML obsolète + Response undefined)
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).catch(() => offlineResponse()));
    return;
  }

  event.respondWith(
    (async () => {
      const cached = await caches.match(event.request);
      try {
        const res = await fetch(event.request);
        if (
          res.ok &&
          (url.pathname === "/" || url.pathname.startsWith("/_next/static"))
        ) {
          const copy = res.clone();
          const cache = await caches.open(CACHE);
          await cache.put(event.request, copy);
        }
        return res;
      } catch {
        return cached ?? offlineResponse();
      }
    })()
  );
});
