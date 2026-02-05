import { TranslationPanel } from "@/components/translator/TranslationPanel";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	return (
		<div className="min-h-screen bg-background">
			<main className="container mx-auto py-8">
				<TranslationPanel />
			</main>
		</div>
	);
}
