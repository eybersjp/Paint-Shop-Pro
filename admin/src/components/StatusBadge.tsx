import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  SUBMITTED: "bg-primary/10 text-primary",
  APPROVED: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]",
  REJECTED: "bg-destructive/10 text-destructive",
  CONVERTED: "bg-primary/15 text-primary",
  EXPIRED: "bg-muted text-muted-foreground",
  CONFIRMED: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]",
  PARTIALLY_FULFILLED: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]",
  FULFILLED: "bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]",
  CANCELLED: "bg-destructive/10 text-destructive",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="secondary"
      className={cn("font-medium text-xs", statusColors[status] ?? "")}
    >
      {status.replace(/_/g, " ")}
    </Badge>
  );
}
