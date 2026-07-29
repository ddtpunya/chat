const CACHE_NAME = "chat-ddt-pwa-v23";
const VERSION = "20260729-stable-send-scroll-v23";
const APP_SHELL = [
    "./",
    "./index.html",
    `./style.css?v=${VERSION}`,
    `./firebase.js?v=${VERSION}`,
    `./auth.js?v=${VERSION}`,
    `./app.js?v=${VERSION}`,
    `./manifest.webmanifest?v=${VERSION}`,
    "./apple-touch-icon.png",
    "./icon-192.png",
    "./icon-512.png",
    "./icon-maskable-512.png"
];

self.addEventListener("install", (event) => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        await Promise.allSettled(APP_SHELL.map(async (asset) => {
            const response = await fetch(asset, { cache: "reload" });
            if (response.ok) await cache.put(asset, response);
        }));
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
            const response = await fetch(request, { cache: "no-store" });
            if (response.ok) {
                const cache = await caches.open(CACHE_NAME);
                cache.put(request, response.clone()).catch(() => {});
            }
            return response;
        } catch {
            return (await caches.match(request))
                || (request.mode === "navigate" ? await caches.match("./index.html") : undefined)
                || Response.error();
        }
    })());
});
