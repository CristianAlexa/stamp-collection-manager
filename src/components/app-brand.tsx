interface AppBrandProps {
  name: string;
  subtitle?: string;
}

/**
 * Displays the application name and optional subtitle.
 *
 *  This is a presentational Component.
 * It does not require client-side Java-Script.
 */

export function AppBrand({ name, subtitle }: AppBrandProps) {
  return (
    <div>
      <h1 className="text-4xl forn-bold text-slate-900">{name}</h1>

      {subtitle && <p className="mt-3 text-lg text-slate-600"></p>}
    </div>
  );
}
