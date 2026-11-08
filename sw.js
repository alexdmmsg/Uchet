// Где деньги?: офлайн-кэш. При изменении файлов увеличьте номер версии.
const CACHE = "kopilka-v3";
const CORE = ["./", "index.html", "manifest.webmanifest", "xlsx.full.min.js",
  "icon-192.png", "icon-512.png", "apple-touch-icon.png", "cat.jpg"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  // Страница: сначала сеть (чтобы получать обновления), без сети — из кэша.
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(r => {
      const copy = r.clone(); caches.open(CACHE).then(c => c.put("index.html", copy)); return r;
    }).catch(() => caches.match("index.html")));
    return;
  }
  // Остальное (скрипты, иконки, шрифты): из кэша, иначе из сети с сохранением.
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if (r.ok || r.type === "opaque") { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return r;
  })));
});
