import { Target, AlertTriangle, CheckCircle2, Lightbulb } from "lucide-react";
import { type Activity } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const iconFor = {
  goal_update: { icon: Target, color: "text-info bg-info/10" },
  new_challenge: { icon: AlertTriangle, color: "text-destructive bg-destructive/10" },
  completed_action: { icon: CheckCircle2, color: "text-success bg-success/10" },
  solution_added: { icon: Lightbulb, color: "text-primary bg-primary/10" },
};

export function ActivityFeed({ items }: { items: Activity[] }) {
  return (
    <ul className="space-y-4">
      {items.map((item) => {
        const { icon: Icon, color } = iconFor[item.type];
        return (
          <li key={item.id} className="flex gap-3">
            <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", color)}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-snug text-foreground">{item.message}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {item.actor} · {item.at}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
