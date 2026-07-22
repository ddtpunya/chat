const CACHE_NAME = "chat-ddt-pwa-v16";
const APP_SHELL = [
    "./",
    "./index.html",
    "./style.css?v=20260723-safari-100-percent-fit-v16",
    "./firebase.js?v=20260723-safari-100-percent-fit-v16",
    "./auth.js?v=20260723-safari-100-percent-fit-v16",
    "./app.js?v=20260723-safari-100-percent-fit-v16",
    "./manifest.webmanifest?v=20260723-safari-100-percent-fit-v16",
    "./apple-touch-icon.png",
    "./icon-192.png",
    "./icon-512.png",
    "./icon-maskable-512.png"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (event) => {
    const request = event.request;
    if (request.method !== "GET") return;

    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;

    // HTML/navigation: network first so updates are not trapped by an old cache.
    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
                    return response;
                })
                .catch(async () => {
                    return (await caches.match(request)) || (await caches.match("./index.html"));
                })
        );
        return;
    }

    // Local assets: network first so Safari immediately receives layout fixes.
    event.respondWith(
        fetch(request)
            .then((response) => {
                if (response && response.ok) {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
                }
                return response;
            })
            .catch(async () => {
                return (await caches.match(request)) || Response.error();
            })
    );
});
