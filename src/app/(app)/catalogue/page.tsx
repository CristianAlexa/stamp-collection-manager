import { FeatureCard } from "@/components/ui/feature-card";
import { PageHeader } from "@/components/ui/page-header";

export default function CataloguePage() {
  return (
    <div>
      <PageHeader
        title="Stamp Catalogue"
        description="Explore stamps from around the world."
      />
      <FeatureCard title="Explore the catalogue" badge="Coming soon">
        <p>Search by country, year, series and catalogue number.</p>
        <p className="mt-2">
          We will support Stanley Gibbons, Scott, Michel, Yvert and Sassone
          references.
        </p>
      </FeatureCard>
    </div>
  );
}
