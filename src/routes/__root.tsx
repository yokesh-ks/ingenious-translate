import Header from "@/components/common/Header";
import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

export const Route = createRootRoute({
	component: RootComponent,
});

function RootComponent() {
	return (
		<>
			<Header />
			<Outlet />
			<TanStackRouterDevtools position="bottom-right" />
		</>
	);
}
