const CACHE_NAME = "chat-ddt-pwa-v25";
const VERSION = "20260729-white-screen-recovery-v25";
const CORE_ASSETS = [
    "./index.html",
    `./style.css?v=${VERSION}`,
    `./firebase.js?v=${VERSION}`,
    `./auth.js?v=${VERSION}`,
    `./app.js?v=${VERSION}`,
    `./manifest.webmanifest?v=${VERSION}`
];

self.addEventListener("install", (event) => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        for (const asset of CORE_ASSETS) {
            try {
                const response = await fetch(asset, { cache: "reload" });
                if (response.ok) await cache.put(asset, response.clone());
            } catch (error) {
                console.warn("Cache awal dilewati:", asset, error);
            }
        }
        await self.skipWaiting();
    })());
});

self.addEventListener("activate", (event) => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
        await self.clients.claim();
    })());
});

self.addEventListener("fetch", (event) => {
    const request = event.request;
    if (request.method !== "GET") return;
    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;

    event.respondWith((async () => {
        try {
            const network = await fetch(request, { cache: "no-store" });
            if (network.ok) {
                const cache = await caches.open(CACHE_NAME);
                cache.put(request, network.clone()).catch(() => {});
            }
            return network;
        } catch (error) {
            const cached = await caches.match(request, { ignoreSearch: false });
            if (cached) return cached;
            if (request.mode === "navigate") {
                return (await caches.match("./index.html")) || Response.error();
            }
            return Response.error();
        }
    })());
});
