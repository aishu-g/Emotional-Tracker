import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { z } from "zod";
import { CalendarDays, ChevronRight, MessageSquare, ListTodo, Plus, Search, LayoutGrid, List, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useWorkspaceStore } from "@/hooks/use-workspace-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

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

const smartGoalsSearchSchema = z.object({
  orgGoalId: z.string().optional(),
});

export const Route = createFileRoute("/smart-goals")({
  validateSearch: (search) => smartGoalsSearchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Smart Goals — PB39" },
      { name: "description", content: "Specific, measurable goals laddered to every organization objective." },
    ],
  }),
  component: SmartGoalsPage,
});

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

function SmartGoalsPage() {
  const { orgGoalId } = Route.useSearch();
  const navigate = useNavigate();
  const {
    orgGoals,
    smartGoals,
    actionItems,
    addSmartGoal,
    addCommentToSmartGoal,
    deleteSmartGoal,
  } = useWorkspaceStore();

  const [view, setView] = useState<"cards" | "table">("cards");
  const [query, setQuery] = useState("");
  const [orgFilter, setOrgFilter] = useState<string>(orgGoalId || "all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Details Sheet Drawer state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Dialog Open state
  const [dialogOpen, setDialogOpen] = useState(false);

  // New Smart Goal form state
  const [title, setTitle] = useState("");
  const [owner, setOwner] = useState("");
  const [startDate, setStartDate] = useState("2026-06-01");
  const [dueDate, setDueDate] = useState("2026-09-30");
  const [parentId, setParentId] = useState("");

  // Comment state
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    if (orgGoalId) {
      setOrgFilter(orgGoalId);
    }
  }, [orgGoalId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return smartGoals.filter((g) =>
      (orgFilter === "all" || g.orgGoalId === orgFilter) &&
      (statusFilter === "all" || g.status === statusFilter) &&
      (!q || g.title.toLowerCase().includes(q) || g.owner.toLowerCase().includes(q)),
    );
  }, [smartGoals, query, orgFilter, statusFilter]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof smartGoals>();
    for (const g of filtered) {
      if (!map.has(g.orgGoalId)) map.set(g.orgGoalId, []);
      map.get(g.orgGoalId)!.push(g);
    }
    return Array.from(map.entries()).map(([orgId, goals]) => ({
      org: orgGoals.find((o) => o.id === orgId) || { id: orgId, name: "Organization Objective" },
      goals,
    }));
  }, [filtered, orgGoals]);

  const activeGoal = useMemo(() => {
    return selectedId ? smartGoals.find((g) => g.id === selectedId) || null : null;
  }, [selectedId, smartGoals]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !owner || !parentId) {
      toast.error("Please fill in all required fields and select an objective.");
      return;
    }

    addSmartGoal({
      title,
      owner,
      startDate,
      dueDate,
      orgGoalId: parentId,
    });

    toast.success(`Smart goal "${title}" created successfully!`);
    setTitle("");
    setOwner("");
    setDialogOpen(false);
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedId) return;

    addCommentToSmartGoal(selectedId, commentText.trim());
    toast.success("Comment posted!");
    setCommentText("");
  };

  return (
    <div className="space-y-6 p-6 md:p-8">
      <PageHeader
        title="Smart Goals"
        description="Break down each organization objective into specific, measurable outcomes."
        actions={
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-md border bg-card p-0.5">
              <button
                type="button"
                onClick={() => setView("cards")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium cursor-pointer transition-colors",
                  view === "cards"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" /> Cards
              </button>
              <button
                type="button"
                onClick={() => setView("table")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium cursor-pointer transition-colors",
                  view === "table"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <List className="h-3.5 w-3.5" /> Table
              </button>
            </div>
          </div>
        }
      />

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search Smart goals…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 pl-9"
          />
        </div>
        <Select value={orgFilter} onValueChange={setOrgFilter}>
          <SelectTrigger className="h-9 w-[240px]">
            <SelectValue placeholder="All annual goals" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All annual goals</SelectItem>
            {orgGoals.map((o) => (
              <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="Not Started">Not Started</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="At Risk">At Risk</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-9 cursor-pointer gap-1">
              <Plus className="mr-1.5 h-3.5 w-3.5" /> New Smart goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Create Smart Goal</DialogTitle>
                <DialogDescription>
                  Establish a specific, measurable key target laddered to an objective.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="space-y-1.5">
                  <Label>Parent Organization Goal *</Label>
                  <Select value={parentId} onValueChange={setParentId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent objective" />
                    </SelectTrigger>
                    <SelectContent>
                      {orgGoals.map((og) => (
                        <SelectItem key={og.id} value={og.id}>
                          {og.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="smart-title">Goal Title *</Label>
                  <Input
                    id="smart-title"
                    placeholder="e.g. Reduce server latency to <200ms"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="smart-owner">Goal Owner *</Label>
                  <Input
                    id="smart-owner"
                    placeholder="e.g. Priya Anand"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="smart-start">Start Date</Label>
                    <Input
                      id="smart-start"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="smart-due">Due Date</Label>
                    <Input
                      id="smart-due"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" type="button" className="cursor-pointer">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" className="cursor-pointer">Create Smart Goal</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {view === "cards" ? (
        <div className="space-y-8">
          {grouped.map(({ org, goals }) => (
            <section key={org.id} className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Link to="/organization-goals" className="text-muted-foreground hover:text-foreground">
                  Annual Goals
                </Link>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                <Link to="/goals/$goalId" params={{ goalId: org.id }} className="font-medium hover:underline">
                  {org.name}
                </Link>
                <span className="ml-2 text-xs text-muted-foreground">{goals.length} Smart goals</span>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {goals.map((g) => {
                  const ais = actionItems.filter((a) => a.smartGoalId === g.id);
                  const doneAi = ais.filter((a) => a.status === "Done").length;
                  return (
                    <div
                      key={g.id}
                      onClick={() => navigate({ to: "/action-plans", search: { smartGoalId: g.id } })}
                      className="group rounded-xl border bg-card p-4 text-left shadow-sm transition hover:shadow-md hover:border-foreground/20 cursor-pointer relative"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-snug group-hover:underline pr-6">{g.title}</p>
                        <StatusBadge value={g.status} />
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <Progress value={g.progress} className="h-1.5" />
                        <span className="w-9 text-xs text-muted-foreground">{g.progress}%</span>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {g.startDate} → {g.dueDate}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t pt-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                              {initials(g.owner)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">{g.owner}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <ListTodo className="h-3.5 w-3.5" />
                            {doneAi}/{ais.length}
                          </span>
                          
                          {/* Details Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedId(g.id);
                            }}
                            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            {g.comments.length}
                          </button>
 
                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSmartGoal(g.id);
                              toast.success("Smart goal deleted successfully");
                            }}
                            className="inline-flex items-center text-destructive hover:text-destructive hover:bg-destructive/10 p-1 rounded cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
          {grouped.length === 0 && (
            <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
              No Smart goals match the current filters.
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Smart Goal</TableHead>
                <TableHead>Organization Goal</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Timeline</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action Items</TableHead>
                <TableHead>Details / Comments</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((g) => {
                const org = orgGoals.find((o) => o.id === g.orgGoalId);
                const ais = actionItems.filter((a) => a.smartGoalId === g.id);
                const doneAi = ais.filter((a) => a.status === "Done").length;
                return (
                  <TableRow
                    key={g.id}
                    className="cursor-pointer"
                    onClick={() => navigate({ to: "/action-plans", search: { smartGoalId: g.id } })}
                  >
                    <TableCell className="font-medium hover:underline">{g.title}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                      {org ? org.name : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                            {initials(g.owner)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs">{g.owner}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {g.startDate} → {g.dueDate}
                    </TableCell>
                    <TableCell className="w-[180px]">
                      <div className="flex items-center gap-2">
                        <Progress value={g.progress} className="h-1.5" />
                        <span className="w-9 text-xs text-muted-foreground">{g.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={g.status} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {doneAi} / {ais.length} done
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs gap-1.5 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedId(g.id);
                        }}
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        Comments ({g.comments.length})
                      </Button>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                        onClick={() => {
                          deleteSmartGoal(g.id);
                          toast.success("Smart goal deleted successfully");
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    No Smart goals match the current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Details / Comments Sheet Drawer */}
      <Sheet open={!!activeGoal} onOpenChange={(o) => !o && setSelectedId(null)}>
        <SheetContent className="w-full sm:max-w-lg p-6 overflow-y-auto">
          {activeGoal && (
            <>
              <SheetHeader className="p-0">
                <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <Link to="/organization-goals" className="hover:text-foreground">Annual Goals</Link>
                  <ChevronRight className="h-3 w-3" />
                  <span className="truncate">
                    {orgGoals.find((o) => o.id === activeGoal.orgGoalId)?.name || "Strategic Objective"}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <SheetTitle className="text-lg leading-snug flex-1">{activeGoal.title}</SheetTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20 cursor-pointer gap-1.5 h-8"
                    onClick={() => {
                      deleteSmartGoal(activeGoal.id);
                      toast.success("Smart goal deleted successfully");
                      setSelectedId(null);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
                <SheetDescription>
                  Owned by {activeGoal.owner} · Due {activeGoal.dueDate}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-5 space-y-5">
                <div className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Progress</span>
                    <span className="text-sm font-semibold">{activeGoal.progress}%</span>
                  </div>
                  <Progress value={activeGoal.progress} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Field label="Status" value={activeGoal.status} />
                  <Field label="Owner" value={activeGoal.owner} />
                  <Field label="Start" value={activeGoal.startDate} />
                  <Field label="Due" value={activeGoal.dueDate} />
                </div>

                <div>
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Action items ({actionItems.filter((a) => a.smartGoalId === activeGoal.id).length})
                  </p>
                  <div className="space-y-2">
                    {actionItems.filter((a) => a.smartGoalId === activeGoal.id).map((a) => (
                      <div key={a.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                        <div className="min-w-0">
                          <p className="truncate font-medium">{a.task}</p>
                          <p className="text-xs text-muted-foreground">{a.assignedTo} · Due {a.dueDate}</p>
                        </div>
                        <StatusBadge value={a.status} />
                      </div>
                    ))}
                    {actionItems.filter((a) => a.smartGoalId === activeGoal.id).length === 0 && (
                      <p className="text-xs text-muted-foreground">No action items defined for this goal.</p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Comments ({activeGoal.comments.length})
                  </p>
                  
                  {/* Post Comment Form */}
                  <form onSubmit={handlePostComment} className="space-y-2">
                    <Textarea
                      placeholder="Add an update or question..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="text-xs"
                      rows={2}
                      required
                    />
                    <Button type="submit" size="sm" className="h-8 text-xs cursor-pointer">
                      Post Comment
                    </Button>
                  </form>

                  <div className="space-y-2 pt-2 border-t">
                    {activeGoal.comments.length === 0 && (
                      <p className="text-xs text-muted-foreground italic text-center py-4">No comments yet. Write the first comment above!</p>
                    )}
                    {activeGoal.comments.map((c) => (
                      <div key={c.id} className="rounded-lg border p-3 bg-muted/20">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-foreground">{c.author}</span>
                          <span className="text-muted-foreground">{c.date}</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground/90">{c.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}
