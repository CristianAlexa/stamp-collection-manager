"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavigationItem {
  label: string;
  href: string;
}

// Application navigation links
const navigationItems: NavigationItem[] = [
  { label: "Home", href: "/" },
  { label: "Catalogue", href: "/catalogue" },
  { label: "My Collection", href: "/collection" },
  { label: "Albums", href: "/albums" },
];

export function AppNavigation() {
  // Get the current URL pathname
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation">
      <div className="flex flex-wrap items-center gap-2">
        {navigationItems.map((item) => {
          // Determine whether the link is active.
          // Also supports nested routes like /catalogue/123.
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`
                rounded-lg px-4 py-2
                text-sm font-medium
                transition-colors duration-200
                focus-visible:outline-2
                focus-visible:outline-offset-2
                focus-visible:outline-blue-500
                ${
                  isActive
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "text-app-foreground hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400"
                }
              `}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
