"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
  // Read the current route from Next.js
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation">
      <div className="flex flex-wrap gap-2">
        {navigationItem.map((item) => {
          // Match the exact route or any of its subpages.
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(`${item.href}`));

          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-100 text-blue-800"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
