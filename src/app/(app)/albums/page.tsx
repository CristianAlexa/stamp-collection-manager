import { PageHeader } from "@/components/ui/page-header";
import { FeatureCard } from "@/components/ui/feature-card";

export default function AlbumsPage() {
  return (
    <div>
      <PageHeader
        title="My Albums"
        description="Organise your stamp collection"
      />
      <FeatureCard title="Your Albums" badge="Coming soon">
        <p>Organise your stamps into albums and sub-albums.</p>
        <p className="mt-2">
          {`You'll also be able to create printable album pages later.`}
        </p>
      </FeatureCard>
    </div>
  );
}
