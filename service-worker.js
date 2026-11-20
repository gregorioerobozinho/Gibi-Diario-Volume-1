const SHELL_CACHE = "gibi-diario-shell-v2";
const CONTENT_CACHE = "gibi-diario-volume-1-content-v1";
const SHELL_FILES = ["./","index.html","styles.css","app.js","comics.json","manifest.webmanifest","Logo.jpg","icon-192.png","icon-512.png"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(SHELL_CACHE).then(cache => cache.addAll(SHELL_FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => ![SHELL_CACHE,CONTENT_CACHE].includes(key)).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    const contentCache = await caches.open(CONTENT_CACHE);
    const cachedContent = await contentCache.match(request);
    if (cachedContent) return cachedContent;
    const shellCache = await caches.open(SHELL_CACHE);
    const cachedShell = await shellCache.match(request);
    if (cachedShell) return cachedShell;
    try {
      const response = await fetch(request);
      if (response.ok && (request.destination === "image" || request.url.endsWith("comics.json"))) {
        contentCache.put(request, response.clone()).catch(()=>{});
      }
      return response;
    } catch (error) {
      const fallback = await shellCache.match("index.html");
      if (fallback) return fallback;
      throw error;
    }
  })());
});
