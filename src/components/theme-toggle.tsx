"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";

const themeOptions = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
] as const;

// A small helper that tells us whether we're in the browser.
function subscribe() {
  return () => {};
}

function getSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  // Avoid displaying a browser-only preference during SSR.
  const mounted = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  if (!mounted) {
    return <div aria-hidden="true" className="h-10 w-52" />;
  }

  return (
    <div
      role="group"
      aria-label="Appearance preference"
      className="flex flex-wrap gap-2"
    >
      {themeOptions.map((option) => {
        const isSelected = theme === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setTheme(option.value)}
            aria-pressed={isSelected}
            className={`rounded-lg border px-3 py-2
              text-sm font-medium transition-colors
              focus-visible:outline-2
              focus-visible:outline-offset-2
              focus-visible:outline-blue-500 ${
                isSelected
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-app-border bg-app-surface text-app-foreground hover:bg-blue-500/10"
              }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
