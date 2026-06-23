import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";

type Variant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "muted"
  | "primary";

const styles: Record<Variant, string> = {
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/15 text-[color:oklch(0.45_0.12_70)] border-warning/30",
  danger: "bg-destructive/10 text-destructive border-destructive/20",
  info: "bg-info/10 text-info border-info/20",
  muted: "bg-muted text-muted-foreground border-border",
  primary: "bg-primary/10 text-primary border-primary/20",
};

const mapping: Record<string, Variant> = {
  // Goal status
  "Completed": "success",
  "In Progress": "info",
  "At Risk": "warning",
  "Not Started": "muted",
  // Challenge status
  "Open": "danger",
  "Investigating": "warning",
  "Resolved": "success",
  // Solution status
  "Implemented": "success",
  "In Review": "info",
  "Proposed": "muted",
  "Archived": "muted",
  // Priority
  "Urgent": "danger",
  "High": "warning",
  "Medium": "info",
  "Low": "muted",
  // Severity (same map)
  "Critical": "danger",
  // Action status
  "Todo": "muted",
  "Doing": "info",
  "Blocked": "danger",
  "Done": "success",
};

export function StatusBadge({ value, className }: { value: string; className?: string }) {
  const { t } = useLanguage();
  const variant = mapping[value] ?? "muted";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        styles[variant],
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full bg-current opacity-80")} />
      {t(value)}
    </span>
  );
}
