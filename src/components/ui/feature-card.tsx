import type { ReactNode } from "react";

interface FeatureCardProps {
  title: string;

  // Optional badge text, e.g. "Coming soon".
  badge?: string;

  // Any valid React-renderable content.
  children: ReactNode;
}
/**
 * A reusable card for application features.
 *
 * Composition allows each page to provide
 * different content through children.
 */
export function FeatureCard({ title, badge, children }: FeatureCardProps) {
  return (
    <section className="rounded-xl border border-app-border bg-app-surface p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-app-foreground">{title}</h2>
        {badge && (
          <span className="rounded-full bg-app-background px-3 py-1 text-xs font-medium text-app-muted">
            {badge}
          </span>
        )}
      </div>
      <div className="mt-4 text-sm leading-6 text-app-muted">{children}</div>
    </section>
  );
}
