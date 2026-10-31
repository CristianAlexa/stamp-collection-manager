import { PageHeader } from "@/components/ui/page-header";
import { FeatureCard } from "@/components/ui/feature-card";

export default function CollectionPage() {
  return (
    <div>
      <PageHeader
        title="My Collection"
        description="Manage the stamps you acually own"
      />

      <FeatureCard title="Your Collection" badge="Coming soon">
        <p>Your owned stamps will appear here.</p>
        <p className="mt-2">
          Track quantity, condition, acquisition details and duplicates.
        </p>
      </FeatureCard>
    </div>
  );
}
