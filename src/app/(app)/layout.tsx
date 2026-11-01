import { AppNavigation } from "@/components/app-navigation";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-app-background text-app-foreground">
      <header className="border-b border-app-border bg-app-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <AppNavigation />
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
