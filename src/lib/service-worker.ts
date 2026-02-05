// Service Worker registration and management
export interface ServiceWorkerStatus {
	isSupported: boolean;
	isRegistered: boolean;
	isUpdateAvailable: boolean;
	registration: ServiceWorkerRegistration | null;
}

let registration: ServiceWorkerRegistration | null = null;

/**
 * Register the service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerStatus> {
	const status: ServiceWorkerStatus = {
		isSupported: "serviceWorker" in navigator,
		isRegistered: false,
		isUpdateAvailable: false,
		registration: null,
	};

	if (!status.isSupported) {
		console.warn("Service Workers are not supported in this browser");
		return status;
	}

	try {
		registration = await navigator.serviceWorker.register("/sw.ts", {
			type: "module",
			scope: "/",
		});

		status.isRegistered = true;
		status.registration = registration;

		// Check for updates
		registration.addEventListener("updatefound", () => {
			const newWorker = registration?.installing;
			if (newWorker) {
				newWorker.addEventListener("statechange", () => {
					if (
						newWorker.state === "installed" &&
						navigator.serviceWorker.controller
					) {
						status.isUpdateAvailable = true;
						// Notify the user about the update
						console.log("New service worker available");
					}
				});
			}
		});

		// Handle controller change (new service worker activated)
		navigator.serviceWorker.addEventListener("controllerchange", () => {
			console.log("Service worker controller changed, reloading page");
			window.location.reload();
		});

		console.log("Service Worker registered successfully");
	} catch (error) {
		console.error("Service Worker registration failed:", error);
	}

	return status;
}

/**
 * Unregister the service worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
	if (!registration) {
		const existingRegistration =
			await navigator.serviceWorker.getRegistration();
		if (existingRegistration) {
			registration = existingRegistration;
		}
	}

	if (registration) {
		const success = await registration.unregister();
		if (success) {
			registration = null;
			console.log("Service Worker unregistered successfully");
		}
		return success;
	}

	return false;
}

/**
 * Update the service worker
 */
export async function updateServiceWorker(): Promise<void> {
	if (registration) {
		await registration.update();
		console.log("Service Worker update check triggered");
	}
}

/**
 * Skip waiting and activate new service worker immediately
 */
export function skipWaiting(): void {
	if (registration?.waiting) {
		registration.waiting.postMessage({ type: "SKIP_WAITING" });
	}
}

/**
 * Clear all caches
 */
export async function clearServiceWorkerCache(): Promise<void> {
	if (registration?.active) {
		registration.active.postMessage({ type: "CLEAR_CACHE" });
	}

	// Also clear caches directly
	if ("caches" in window) {
		const cacheNames = await caches.keys();
		await Promise.all(cacheNames.map((name) => caches.delete(name)));
		console.log("All caches cleared");
	}
}

/**
 * Get service worker status
 */
export async function getServiceWorkerStatus(): Promise<ServiceWorkerStatus> {
	const status: ServiceWorkerStatus = {
		isSupported: "serviceWorker" in navigator,
		isRegistered: false,
		isUpdateAvailable: false,
		registration: null,
	};

	if (!status.isSupported) {
		return status;
	}

	try {
		const reg = await navigator.serviceWorker.getRegistration();
		if (reg) {
			status.isRegistered = true;
			status.registration = reg;
			status.isUpdateAvailable = !!reg.waiting;
			registration = reg;
		}
	} catch (error) {
		console.error("Failed to get service worker status:", error);
	}

	return status;
}

/**
 * Listen for service worker messages
 */
export function onServiceWorkerMessage(
	callback: (event: MessageEvent) => void,
): () => void {
	if ("serviceWorker" in navigator) {
		navigator.serviceWorker.addEventListener("message", callback);
		return () => {
			navigator.serviceWorker.removeEventListener("message", callback);
		};
	}
	return () => {};
}
