const CACHE_NAME = "omnibox-v11";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./js/lunar.js",
  "./js/units.js",
  "./js/currency.js",
  "./js/datahub-sync.js",
  "./js/gold.js",
  "./js/app.js",
  "./manifest.json",
  "./favicon.png",
  "./apple-touch-icon.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  // Chỉ cache static file trong app, không cache proxy URL
  if (e.request.url.includes("pXML.aspx") || e.request.url.includes("allorigins")) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});
