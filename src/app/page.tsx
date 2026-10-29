import { getStampLabel, type Stamp } from "@/types/stamp";

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
  const appName: string = "Stamp Collection Manager";

  const description: string =
    "Organise your stamps, albums and catalogue references.";

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <p className="mb-3 text-sm font-semibold text-blue-600">
          Personal-first · Multi-user-ready
        </p>

        <h1 className="text-4xl font-bold text-slate-900">
          {appName} by Cristian
        </h1>

        <p className="mt-4 text-lg text-slate-600">{description}</p>

        <div className="mt-10 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Welcome to your collection
          </h2>

          <p className="mt-2 text-slate-600">
            Your stamp catalogue is coming soon.
          </p>
        </div>
        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Example Catalogue Entry
          </h2>

          <p className="mt-3 text-slate-700">{stampLabel}</p>

          <p className="mt-2 text-sm text-slate-500">
            {exampleStamp.description}
          </p>
        </section>
      </div>
    </main>
  );
}
