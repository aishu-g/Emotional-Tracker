import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ChevronRight,
  Target,
  CheckCircle2,
  ListTodo,
  AlertTriangle,
  Lightbulb,
  Search,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  organizationGoals,
  smartGoals,
  actionItems,
  challenges,
  solutions,
} from "@/lib/mock-data";

export const Route = createFileRoute("/traceability")({
  head: () => ({
    meta: [
      { title: "Goal Traceability — Northstar" },
      {
        name: "description",
        content:
          "Follow every organization goal down through SMART goals, action items, challenges and solutions.",
      },
    ],
  }),
  component: TraceabilityPage,
});

function TraceabilityPage() {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => ({
    [organizationGoals[0]?.id ?? ""]: true,
  }));

  const toggle = (id: string) =>
    setExpanded((e) => ({ ...e, [id]: !e[id] }));

  const filteredOrgs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return organizationGoals;
    return organizationGoals.filter((g) =>
      g.name.toLowerCase().includes(q) || g.owner.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="space-y-6 p-6 md:p-8">
      <PageHeader
        title="Goal Traceability"
        description="A single, drill-down view from organization goals down to every challenge and solution."
      />

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search organization goals…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-9 pl-9"
        />
      </div>

      <div className="space-y-3">
        {filteredOrgs.map((og) => {
          const sgs = smartGoals.filter((s) => s.orgGoalId === og.id);
          const open = !!expanded[og.id];
          return (
            <div key={og.id} className="rounded-xl border bg-card shadow-sm">
              <Row
                level={0}
                icon={Target}
                title={og.name}
                meta={`${sgs.length} SMART goals · Owner ${og.owner}`}
                right={
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex w-40 items-center gap-2">
                      <Progress value={og.progress} className="h-1.5" />
                      <span className="w-9 text-xs text-muted-foreground">{og.progress}%</span>
                    </div>
                    <StatusBadge value={og.status} />
                  </div>
                }
                open={open}
                onToggle={() => toggle(og.id)}
              />
              {open && (
                <div className="border-t bg-muted/30">
                  {sgs.map((sg) => {
                    const ais = actionItems.filter((a) => a.smartGoalId === sg.id);
                    const sgOpen = !!expanded[sg.id];
                    return (
                      <div key={sg.id} className="border-b last:border-b-0">
                        <Row
                          level={1}
                          icon={CheckCircle2}
                          title={sg.title}
                          meta={`${ais.length} action items · Due ${sg.dueDate}`}
                          right={
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-muted-foreground">{sg.progress}%</span>
                              <StatusBadge value={sg.status} />
                            </div>
                          }
                          open={sgOpen}
                          onToggle={() => toggle(sg.id)}
                        />
                        {sgOpen && (
                          <div className="bg-background/60">
                            {ais.map((ai) => {
                              const chs = challenges.filter((c) => c.actionItemId === ai.id);
                              const aiOpen = !!expanded[ai.id];
                              return (
                                <div key={ai.id} className="border-t">
                                  <Row
                                    level={2}
                                    icon={ListTodo}
                                    title={ai.task}
                                    meta={`Owner ${ai.assignedTo} · Due ${ai.dueDate} · ${chs.length} challenge${chs.length === 1 ? "" : "s"}`}
                                    right={<StatusBadge value={ai.status} />}
                                    open={aiOpen}
                                    onToggle={() => toggle(ai.id)}
                                  />
                                  {aiOpen && (
                                    <div className="bg-muted/20 py-2">
                                      {chs.length === 0 && (
                                        <div className="px-12 py-3 text-xs text-muted-foreground">
                                          No challenges raised.
                                        </div>
                                      )}
                                      {chs.map((ch) => {
                                        const sols = solutions.filter(
                                          (s) => s.relatedChallengeId === ch.id,
                                        );
                                        const chOpen = !!expanded[ch.id];
                                        return (
                                          <div key={ch.id} className="border-t border-dashed">
                                            <Row
                                              level={3}
                                              icon={AlertTriangle}
                                              title={ch.title}
                                              meta={`Raised by ${ch.raisedBy} · ${ch.createdAt}`}
                                              right={
                                                <div className="flex items-center gap-2">
                                                  <StatusBadge value={ch.severity} />
                                                  <StatusBadge value={ch.status} />
                                                </div>
                                              }
                                              open={chOpen}
                                              onToggle={() => toggle(ch.id)}
                                            />
                                            {chOpen && (
                                              <div className="space-y-2 px-14 py-3">
                                                {sols.length === 0 && (
                                                  <div className="text-xs text-muted-foreground">
                                                    No solutions submitted yet.
                                                  </div>
                                                )}
                                                {sols.map((s) => (
                                                  <div
                                                    key={s.id}
                                                    className="flex items-start gap-3 rounded-lg border bg-card p-3"
                                                  >
                                                    <Lightbulb className="mt-0.5 h-4 w-4 text-primary" />
                                                    <div className="flex-1 min-w-0">
                                                      <div className="flex items-center justify-between gap-2">
                                                        <p className="text-sm font-medium leading-snug">{s.title}</p>
                                                        <StatusBadge value={s.status} />
                                                      </div>
                                                      <p className="mt-1 text-xs text-muted-foreground">
                                                        {s.description}
                                                      </p>
                                                      <p className="mt-1.5 text-[11px] text-muted-foreground">
                                                        {s.director} · {s.date}
                                                      </p>
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Row({
  level,
  icon: Icon,
  title,
  meta,
  right,
  open,
  onToggle,
}: {
  level: 0 | 1 | 2 | 3;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  meta: string;
  right: React.ReactNode;
  open: boolean;
  onToggle: () => void;
}) {
  const pad = ["pl-4", "pl-10", "pl-16", "pl-20"][level];
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex w-full items-center gap-3 py-3 pr-4 text-left transition-colors hover:bg-muted/40",
        pad,
      )}
    >
      <ChevronRight
        className={cn(
          "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
          open && "rotate-90",
        )}
      />
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border",
          level === 0 && "bg-primary/10 text-primary border-primary/20",
          level === 1 && "bg-info/10 text-info border-info/20",
          level === 2 && "bg-muted text-foreground/70",
          level === 3 && "bg-warning/10 text-[color:oklch(0.45_0.12_70)] border-warning/30",
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("truncate", level === 0 ? "text-sm font-semibold" : "text-sm font-medium")}>
          {title}
        </p>
        <p className="truncate text-xs text-muted-foreground">{meta}</p>
      </div>
      <div className="flex shrink-0 items-center">{right}</div>
    </button>
  );
}
