import { PageHeader } from "@/components/ui/page-header";
import { FeatureCard } from "@/components/ui/feature-card";
import { StampList } from "@/features/catalogue/components/stamp-list";

export default function CataloguePage() {
  return (
    <div>
      <PageHeader
        title="Stamp Catalogue"
        description="Explore stamps from around the world."
      />

      <FeatureCard title="Catalogue stamps">
        <StampList />
      </FeatureCard>
    </div>
  );
}
