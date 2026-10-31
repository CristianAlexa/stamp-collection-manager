import { AppNavigation } from "@/components/app-navigation";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <AppNavigation />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
