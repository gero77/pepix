// Subir VERSION en cada publicación.
const VERSION = "pepix-3";
const SHELL = ["./", "./index.html"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Red primero para todo lo propio (la página, el manifiesto y los íconos nunca quedan viejos);
// la copia en caché solo se usa sin conexión. Lo externo (Firebase, TMDB, fuentes) pasa directo.
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  const isPage = e.request.mode === "navigate" || u.pathname.endsWith("/") || u.pathname.endsWith("index.html");
  e.respondWith(
    fetch(e.request).then(r => {
      if (isPage && r.ok) { const c = r.clone(); caches.open(VERSION).then(x => x.put("./index.html", c)); }
      return r;
    }).catch(() => caches.match(isPage ? "./index.html" : e.request))
  );
});
