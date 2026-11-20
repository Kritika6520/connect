import Link from "next/link";
import { ArrowRight, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type IdeaEmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
};

export function IdeaEmptyState({ title, description, actionLabel, actionHref, secondaryLabel, secondaryHref }: IdeaEmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center px-6 py-14 text-center">
        <span className="flex size-12 items-center justify-center rounded-xl bg-accent text-primary"><Lightbulb className="size-5" /></span>
        <h2 className="mt-5 text-xl font-semibold">{title}</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {actionLabel && actionHref && <Button asChild><Link href={actionHref}>{actionLabel}<ArrowRight className="size-4" /></Link></Button>}
          {secondaryLabel && secondaryHref && <Button asChild variant="outline"><Link href={secondaryHref}>{secondaryLabel}</Link></Button>}
        </div>
      </CardContent>
    </Card>
  );
}
