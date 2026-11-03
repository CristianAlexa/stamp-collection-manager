import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type CollectionCardProps = {
  title: string;
  description: string;
  stampCount: number;
  href: string;
};

export function CollectionCard({
  title,
  description,
  stampCount,
  href,
}: CollectionCardProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <p className="text-3xl font-semibold tabular-nums">{stampCount}</p>

        <p className="text-sm text-muted-foreground">
          {stampCount === 1 ? "stamp" : "stamps"}
        </p>
      </CardContent>

      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href={href}>Browse {title}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
