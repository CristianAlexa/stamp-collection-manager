import { getStampLabel, type Stamp } from "@/types/stamp";
import { AppBrand } from "@/components/app-brand";

const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "Stamp Collection Manager";

const exampleStamp: Stamp = {
  id: "stamp-001",
  name: "Penny Black",
  country: "Great Britain",
  year: 1840,
  description: "The world's first adhesive postage stamp.",
};

const stampLabel = getStampLabel(exampleStamp);

export default function HomePage() {
  // Our first Stamp Collection Manager homepage

  const description: string =
    "Organise your stamps, albums and catalogue references.";

  return (
    <main className="min-h-screen bg-app-background px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <p className="mb-3 text-sm font-semibold text-blue-600">
          Personal-first · Multi-user-ready
        </p>

        <AppBrand
          name={appName}
          subtitle="Organise your stamps, albums and cataloque references"
        />

        <p className="mt-4 text-lg text-app-muted">{description}</p>

        <div className="mt-10 rounded-xl border border-app-border bg-app-surface p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-app-foreground">
            Welcome to your collection
          </h2>

          <p className="mt-2 text-app-muted">
            Your stamp catalogue is coming soon.
          </p>
        </div>
        <section className="mt-6 rounded-xl border border-app-border bg-app-surface p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-app-foreground">
            Example Catalogue Entry
          </h2>

          <p className="mt-3 text-app-foreground">{stampLabel}</p>

          <p className="mt-2 text-sm text-app-muted">
            {exampleStamp.description}
          </p>
        </section>
      </div>
    </main>
  );
}
