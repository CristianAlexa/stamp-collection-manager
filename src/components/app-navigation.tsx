import Link from "next/link";

interface NavigationItem {
  label: string;
  href: string;
}

const navigationItem: NavigationItem[] = [
  { label: "Home", href: "/" },
  { label: "Catalogue", href: "/catalogue" },
  { label: "My Collection", href: "/collection" },
  { label: "Albums", href: "/albums" },
];

/**
 * Shared application navigation.
 *
 * Next.js Link enables client-side navigation
 * between internal application routes.
 */

export function AppNavigation() {
  return (
    <nav atia-label="Main navigation">
      <div className="flex flex-wrap gap-2">
        {navigationItem.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700
            transition-colors hover:bg-slate-100 hover:text-blue-700"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
