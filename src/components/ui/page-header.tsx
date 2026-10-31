interface PageHeaderProps {
  // every page must have a title
  title: string;

  // A description is optional
  description?: string;
}

/**
 * Displeys a consistent heading for application pages.
 *
 * This component can be used by the catalogue,
 * collection, albums and future dashboard
 */

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="mb-8">
      <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
      {description && (
        <p className="mt-3 max-w-2xl text-slate-600">{description}</p>
      )}
    </header>
  );
}
