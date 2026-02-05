"use client";

export default function Header() {
	return (
		<header className="sticky top-0 z-50 border-border border-b-2 bg-secondary-background">
			<div className="container mx-auto flex h-16 items-center justify-between px-6">
				<div className="flex items-center gap-6">
					<a href={"/"} className="font-bold font-heading text-lg">
						IngeniousClan
					</a>
				</div>
			</div>
		</header>
	);
}
