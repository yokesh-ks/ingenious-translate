// Service Worker for offline support and model caching
/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = "ingenious-translate-v1";
const STATIC_ASSETS = ["/", "/index.html", "/manifest.json"];

const MODEL_CACHE = "ingenious-translate-models-v1";

// Install event - cache static assets
self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(STATIC_ASSETS).catch((error) => {
				console.error("Failed to cache static assets:", error);
			});
		}),
	);
	self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames
					.filter((name) => name !== CACHE_NAME && name !== MODEL_CACHE)
					.map((name) => caches.delete(name)),
			);
		}),
	);
	self.clients.claim();
});

// Fetch event - handle requests
self.addEventListener("fetch", (event) => {
	const url = new URL(event.request.url);

	// Handle model downloads from Hugging Face
	if (url.hostname === "huggingface.co" || url.hostname.includes("cdn")) {
		event.respondWith(
			caches.open(MODEL_CACHE).then((cache) => {
				return cache.match(event.request).then((cachedResponse) => {
					if (cachedResponse) {
						return cachedResponse;
					}

					return fetch(event.request).then((response) => {
						// Only cache successful responses
						if (response.ok && response.status === 200) {
							cache.put(event.request, response.clone());
						}
						return response;
					});
				});
			}),
		);
		return;
	}

	// For static assets, try network first, then cache
	event.respondWith(
		fetch(event.request)
			.then((response) => {
				// Cache successful responses for static assets
				if (
					response.ok &&
					(event.request.destination === "script" ||
						event.request.destination === "style" ||
						event.request.destination === "document")
				) {
					const responseToCache = response.clone();
					caches.open(CACHE_NAME).then((cache) => {
						cache.put(event.request, responseToCache);
					});
				}
				return response;
			})
			.catch(() => {
				// If network fails, try cache
				return caches.match(event.request).then((cachedResponse) => {
					if (cachedResponse) {
						return cachedResponse;
					}
					// Return a basic offline page for navigation requests
					if (event.request.mode === "navigate") {
						return caches.match("/index.html").then((indexResponse) => {
							if (indexResponse) {
								return indexResponse;
							}
							// Fallback response if index.html is not cached
							return new Response("Offline", {
								status: 503,
								headers: { "Content-Type": "text/plain" },
							});
						});
					}
					// For other requests, return a network error
					return new Response("Network error", {
						status: 408,
						headers: { "Content-Type": "text/plain" },
					});
				});
			}),
	);
});

// Message event - handle messages from the main thread
self.addEventListener("message", (event) => {
	if (event.data && event.data.type === "SKIP_WAITING") {
		self.skipWaiting();
	}

	if (event.data && event.data.type === "CLEAR_CACHE") {
		event.waitUntil(
			Promise.all([caches.delete(CACHE_NAME), caches.delete(MODEL_CACHE)]).then(
				() => {
					return self.clients.matchAll().then((clients) => {
						for (const client of clients) {
							client.postMessage({ type: "CACHE_CLEARED" });
						}
					});
				},
			),
		);
	}
});

export {};
