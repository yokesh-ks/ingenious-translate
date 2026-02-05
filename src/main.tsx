import { RouterProvider, createRouter } from "@tanstack/react-router";
import React from "react";
import ReactDOM from "react-dom/client";
import { routeTree } from "./routeTree.gen";
import "@/styles/globals.css";
import { registerServiceWorker } from "@/lib/service-worker";

// Set up a Router instance
const router = createRouter({
	routeTree,
	defaultPreload: "intent",
});

// Register things for typesafety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

// biome-ignore lint/style/noNonNullAssertion: <explanation>
const rootElement = document.getElementById("app")!;

if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(<RouterProvider router={router} />);
}

// Register service worker for offline support
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
	registerServiceWorker().then((status) => {
		if (status.isRegistered) {
			console.log("✅ Service Worker registered successfully");
		}
	});
}
