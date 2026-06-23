import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { ChevronRight, Target, CheckCircle2, ListTodo, AlertTriangle, Lightbulb, ArrowLeft, Edit, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { ActivityFeed } from "@/components/activity-feed";
import { KpiCard } from "@/components/kpi-card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { LineSeriesChart } from "@/components/charts";
import { useWorkspaceStore } from "@/hooks/use-workspace-store";
import { useState, useMemo } from "react";
import { toast } from "sonner";

// Dialog components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/goals/$goalId")({
  head: ({ params }) => ({
    meta: [
      { title: `Goal Detail — PB39` },
      { name: "description", content: `Details, hierarchy and timeline for goal ${params.goalId}.` },
    ],
  }),
  component: GoalDetailPage,
  notFoundComponent: () => (
    <div className="p-8 text-center text-muted-foreground">Goal not found.</div>
  ),
});

const timeline = [
  { week: "W1", progress: 5 }, { week: "W2", progress: 12 }, { week: "W3", progress: 18 },
  { week: "W4", progress: 25 }, { week: "W5", progress: 31 }, { week: "W6", progress: 40 },
  { week: "W7", progress: 48 }, { week: "W8", progress: 55 }, { week: "W9", progress: 62 },
  { week: "W10", progress: 68 },
];

function GoalDetailPage() {
  const { goalId } = Route.useParams();
  const navigate = useNavigate();
  const {
    orgGoals,
    smartGoals,
    actionItems,
    challenges,
    solutions,
    activities,
    updateOrgGoal,
    deleteOrgGoal,
    orgGoalStatuses,
    departments,
  } = useWorkspaceStore();

  const goal = orgGoals.find((g) => g.id === goalId);
  if (!goal) throw notFound();

  // Dialog and form states
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState(goal.name);
  const [department, setDepartment] = useState(goal.department);
  const [owner, setOwner] = useState(goal.owner);
  const [status, setStatus] = useState(goal.status);
  const [progress, setProgress] = useState(goal.progress);
  const [description, setDescription] = useState(goal.description);
  const [smartGoalCount, setSmartGoalCount] = useState(goal.smartGoalCount);

  const statusOptions = useMemo(() => {
    if (!orgGoalStatuses.includes(status)) {
      return [status, ...orgGoalStatuses];
    }
    return orgGoalStatuses;
  }, [status, orgGoalStatuses]);

  const linkedSmart = useMemo(() => {
    return smartGoals.filter((s) => s.orgGoalId === goal.id);
  }, [smartGoals, goal.id]);

  const linkedActions = useMemo(() => {
    return actionItems.filter((a) => linkedSmart.some((s) => s.id === a.smartGoalId));
  }, [actionItems, linkedSmart]);

  const linkedChallenges = useMemo(() => {
    return challenges.filter((c) => c.relatedGoalId === goal.id);
  }, [challenges, goal.id]);

  const linkedSolutions = useMemo(() => {
    return solutions.filter((s) => linkedChallenges.some((c) => c.id === s.relatedChallengeId));
  }, [solutions, linkedChallenges]);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !owner) {
      toast.error("Please fill in required fields.");
      return;
    }

    updateOrgGoal(goal.id, {
      name,
      goal: name,
      department,
      owner,
      status,
      progress: Number(progress),
      smartGoalCount: Number(smartGoalCount),
      description,
    });

    toast.success("Strategic objective updated successfully!");
    setEditOpen(false);
  };

  return (
    <div className="space-y-6 p-6 md:p-8">
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link to="/organization-goals" className="inline-flex items-center gap-1 hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> Organization Goals
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{goal.id.toUpperCase()}</span>
      </nav>

      <PageHeader
        title={goal.name}
        description={goal.description}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge value={goal.status} />
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="cursor-pointer gap-1.5">
                  <Edit className="h-3.5 w-3.5" />
                  Edit goal
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px]">
                <form onSubmit={handleUpdate}>
                  <DialogHeader>
                    <DialogTitle>Edit Strategic Objective</DialogTitle>
                    <DialogDescription>
                      Modify high-level settings, status and tracking metrics.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-name">Goal Name *</Label>
                      <Input
                        id="edit-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Department</Label>
                        <Select value={department} onValueChange={(val) => setDepartment(val as any)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="edit-owner">Owner *</Label>
                        <Input
                          id="edit-owner"
                          value={owner}
                          onChange={(e) => setOwner(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5 col-span-1">
                        <Label>Status</Label>
                        <Select value={status} onValueChange={(val) => setStatus(val)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((st) => (
                              <SelectItem key={st} value={st}>{st}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5 col-span-1">
                        <Label htmlFor="edit-progress">Progress %</Label>
                        <Input
                          id="edit-progress"
                          type="number"
                          min={0}
                          max={100}
                          value={progress}
                          onChange={(e) => setProgress(Number(e.target.value))}
                        />
                      </div>
                      <div className="space-y-1.5 col-span-1">
                        <Label htmlFor="edit-smart-count">Smart Goals</Label>
                        <Input
                          id="edit-smart-count"
                          type="number"
                          min={0}
                          value={smartGoalCount}
                          onChange={(e) => setSmartGoalCount(Number(e.target.value))}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="edit-desc">Description</Label>
                      <Textarea
                        id="edit-desc"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline" type="button" className="cursor-pointer">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button type="submit" className="cursor-pointer">Save Changes</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Button
              size="sm"
              variant="outline"
              className="cursor-pointer gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
              onClick={() => {
                deleteOrgGoal(goal.id);
                toast.success("Goal deleted successfully");
                navigate({ to: "/organization-goals" });
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete goal
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard label="Progress" value={`${goal.progress}%`} icon={Target} hint="overall" />
        <KpiCard label="SMART Goals" value={linkedSmart.length} icon={CheckCircle2} hint="aligned" />
        <KpiCard label="Action Items" value={linkedActions.length} icon={ListTodo} hint="in flight" />
        <KpiCard label="Challenges" value={linkedChallenges.length} icon={AlertTriangle} hint="raised" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <SectionCard title="Progress Timeline" description="Weekly progress against this goal" className="lg:col-span-2">
          <LineSeriesChart
            data={timeline}
            xKey="week"
            series={[{ key: "progress", label: "Progress %", color: "var(--color-chart-1)" }]}
          />
        </SectionCard>
        <SectionCard title="Activity history" description="Recent updates">
          <ActivityFeed items={activities.slice(0, 5)} />
        </SectionCard>
      </div>

      <SectionCard title="Goal hierarchy" description="From strategy down to execution and resolution">
        <div className="space-y-4">
          <TreeNode icon={Target} color="text-primary bg-primary/10" label="Organization Goal" title={goal.name} meta={`${goal.progress}% · ${goal.owner}`}>
            <Progress value={goal.progress} className="h-1.5 mt-2" />
          </TreeNode>

          <div className="ml-6 space-y-3 border-l pl-6">
            {linkedSmart.map((s) => (
              <TreeNode key={s.id} icon={CheckCircle2} color="text-info bg-info/10" label="SMART Goal" title={s.title}
                        meta={`${s.progress}% · ${s.owner} · due ${s.dueDate}`} badge={<StatusBadge value={s.status} />}>
                <div className="ml-6 mt-3 space-y-2 border-l pl-6">
                  {linkedActions.filter((a) => a.smartGoalId === s.id).map((a) => (
                    <div key={a.id} className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-warning/15 text-[color:oklch(0.45_0.12_70)]">
                        <ListTodo className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{a.task}</p>
                        <p className="text-xs text-muted-foreground">{a.assignedTo} · due {a.dueDate}</p>
                      </div>
                      <StatusBadge value={a.status} />
                    </div>
                  ))}
                </div>
              </TreeNode>
            ))}
          </div>

          {linkedChallenges.length > 0 && (
            <div className="ml-6 space-y-3 border-l pl-6">
              {linkedChallenges.map((c) => (
                <TreeNode key={c.id} icon={AlertTriangle} color="text-destructive bg-destructive/10" label="Challenge" title={c.title}
                          meta={`${c.owner} · ${c.createdAt}`} badge={<StatusBadge value={c.status} />}>
                  <div className="ml-6 mt-3 space-y-2 border-l pl-6">
                    {linkedSolutions.filter((sol) => sol.relatedChallengeId === c.id).map((sol) => (
                      <div key={sol.id} className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-success/15 text-success">
                          <Lightbulb className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{sol.title}</p>
                          <p className="text-xs text-muted-foreground">Impact {sol.impact}/10 · {sol.owner}</p>
                        </div>
                        <StatusBadge value={sol.status} />
                      </div>
                    ))}
                  </div>
                </TreeNode>
              ))}
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}

function TreeNode({
  icon: Icon, color, label, title, meta, badge, children,
}: {
  icon: any; color: string; label: string; title: string; meta?: string;
  badge?: React.ReactNode; children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-start gap-3">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-0.5 font-medium leading-snug">{title}</p>
          {meta && <p className="mt-0.5 text-xs text-muted-foreground">{meta}</p>}
        </div>
        {badge}
      </div>
      {children}
    </div>
  );
}
