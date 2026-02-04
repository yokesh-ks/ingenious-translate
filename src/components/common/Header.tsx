"use client";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b-2 border-border bg-secondary-background">
      <div className="mx-auto flex h-16 container items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <a href={`/`} className="font-heading text-lg font-bold">
            IngeniousClan
          </a>
        </div>
      </div>
    </header>
  );
}
