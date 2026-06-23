import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { ArrowUpDown, LayoutGrid, List, Search, SlidersHorizontal, Plus, Trash2, Pencil } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useWorkspaceStore } from "@/hooks/use-workspace-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/organization-goals")({
  head: () => ({
    meta: [
      { title: "Annual Goals (2026-2027) — PB39" },
      { name: "description", content: "Track every organizational goal, owner and SMART goal completion in one view." },
    ],
  }),
  component: OrganizationGoalsPage,
});

type SortKey = "name" | "owner" | "progress" | "status" | "endDate";

function OrganizationGoalsPage() {
  const navigate = useNavigate();
  const { orgGoals, smartGoals, addOrgGoal, orgGoalStatuses, deleteOrgGoal, updateOrgGoal, profile, members, departments } = useWorkspaceStore();

  const [view, setView] = useState<"cards" | "table">("cards");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOwner, setSelectedOwner] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("progress");
  const [sortAsc, setSortAsc] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form states for new goal
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("Revenue");
  const [owner, setOwner] = useState("");
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState("2026-12-31");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [progressVal, setProgressVal] = useState(0);
  const [smartGoalCount, setSmartGoalCount] = useState(0);

  // Form states for editing goal
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editDepartment, setEditDepartment] = useState("Revenue");
  const [editStartDate, setEditStartDate] = useState("2026-01-01");
  const [editEndDate, setEditEndDate] = useState("2026-12-31");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editProgress, setEditProgress] = useState(0);

  // Set initial status when orgGoalStatuses loads
  useEffect(() => {
    if (orgGoalStatuses && orgGoalStatuses.length > 0) {
      setStatus((prev) => prev || orgGoalStatuses[0]);
    }
  }, [orgGoalStatuses]);

  const startEdit = (g: any) => {
    setEditingGoal(g);
    setEditName(g.name || "");
    setEditDepartment(g.department || "Revenue");
    setEditStartDate(g.startDate || "2026-01-01");
    setEditEndDate(g.endDate || "2026-12-31");
    setEditDescription(g.description || "");
    setEditStatus(g.status || "");
    setEditProgress(g.progress || 0);
  };

  const rollups = useMemo(() => {
    return orgGoals.map((g) => {
      const sgs = smartGoals.filter((s) => s.orgGoalId === g.id);
      const total = sgs.length;
      const completed = sgs.filter((s) => s.status === "Completed").length;
      const computedProgress = total
        ? Math.round(sgs.reduce((s, x) => s + x.progress, 0) / total)
        : g.progress;
      return { ...g, smartTotal: total, smartCompleted: completed, computedProgress };
    });
  }, [orgGoals, smartGoals]);

  const rows = useMemo(() => {
    let r = rollups.filter((g) =>
      (statusFilter === "all" || g.status === statusFilter) &&
      (selectedOwner === "all" || g.ownerId === selectedOwner) &&
      (g.name.toLowerCase().includes(query.toLowerCase()) ||
        g.owner.toLowerCase().includes(query.toLowerCase()) ||
        g.department.toLowerCase().includes(query.toLowerCase()))
    );
    r = [...r].sort((a, b) => {
      const av = (a as any)[sortKey];
      const bv = (b as any)[sortKey];
      if (av < bv) return sortAsc ? -1 : 1;
      if (av > bv) return sortAsc ? 1 : -1;
      return 0;
    });
    return r;
  }, [rollups, query, statusFilter, selectedOwner, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !owner) {
      toast.error("Please fill in all required fields.");
      return;
    }
    const added = await addOrgGoal({
      goal: name,
      name,
      owner,
      department,
      startDate,
      endDate,
      description,
      status,
      progress: progressVal,
      smartGoalCount,
    });
    if (added) {
      toast.success(`Organization goal "${added.name}" created successfully!`);
    } else {
      toast.error("Failed to create organization goal in database.");
    }
    
    // Clear state
    setName("");
    setOwner("");
    setDepartment("Revenue");
    setDescription("");
    setProgressVal(0);
    setSmartGoalCount(0);
    setStatus(orgGoalStatuses[0] || "");
    setDialogOpen(false);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoal) return;
    if (!editName) {
      toast.error("Please fill in all required fields.");
      return;
    }
    await updateOrgGoal(editingGoal.id, {
      name: editName,
      department: editDepartment,
      startDate: editStartDate,
      endDate: editEndDate,
      description: editDescription,
      status: editStatus,
      progress: editProgress,
    });
    toast.success(`Goal "${editName}" updated successfully!`);
    setEditingGoal(null);
  };

  return (
    <div className="space-y-6 p-6 md:p-8">
      <PageHeader
        title="Annual Goals (2026-2027)"
        description="This goal can be founder goal for an organization for period of one year."
        actions={
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-md border bg-card p-0.5">
              <button
                type="button"
                onClick={() => setView("cards")}
                className={cn("inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium cursor-pointer", view === "cards" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}
              >
                <LayoutGrid className="h-3.5 w-3.5" /> Cards
              </button>
              <button
                type="button"
                onClick={() => setView("table")}
                className={cn("inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium cursor-pointer", view === "table" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}
              >
                <List className="h-3.5 w-3.5" /> Table
              </button>
            </div>
          </div>
        }
      />

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <Select value={selectedOwner} onValueChange={setSelectedOwner}>
          <SelectTrigger className="h-9 w-[180px]">
            <SelectValue placeholder="All Owners" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Owners</SelectItem>
            {members.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search goals or owners…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-[170px]">
            <SlidersHorizontal className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {orgGoalStatuses.map((st) => (
              <SelectItem key={st} value={st}>{st}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-9 cursor-pointer gap-1">
              <Plus className="h-3.5 w-3.5" />
              New Annual goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Create Strategic Objective</DialogTitle>
                <DialogDescription>
                  Add a high-level organizational goal.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="space-y-1.5">
                  <Label htmlFor="goal-name">Goal Name *</Label>
                  <Input
                    id="goal-name"
                    placeholder="e.g. Expand gross retention to 96%"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Department</Label>
                    <Select value={department} onValueChange={setDepartment}>
                      <SelectTrigger>
                        <SelectValue placeholder="Department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="goal-owner">Owner *</Label>
                    <Input
                      id="goal-owner"
                      placeholder="e.g. Sarah Chen"
                      value={owner}
                      onChange={(e) => setOwner(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5 col-span-1">
                    <Label>Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {orgGoalStatuses.map((st) => (
                          <SelectItem key={st} value={st}>{st}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 col-span-1">
                    <Label htmlFor="goal-progress">Progress %</Label>
                    <Input
                      id="goal-progress"
                      type="number"
                      min={0}
                      max={100}
                      value={progressVal}
                      onChange={(e) => setProgressVal(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1.5 col-span-1">
                    <Label htmlFor="goal-smart-count">Smart Goals</Label>
                    <Input
                      id="goal-smart-count"
                      type="number"
                      min={0}
                      value={smartGoalCount}
                      onChange={(e) => setSmartGoalCount(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="goal-start">Start Date</Label>
                    <Input
                      id="goal-start"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="goal-end">End Date</Label>
                    <Input
                      id="goal-end"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="goal-desc">Description</Label>
                  <Textarea
                    id="goal-desc"
                    placeholder="Detail the target outcomes and high-level strategy..."
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
                <Button type="submit" className="cursor-pointer">Create Goal</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <div className="ml-auto text-xs text-muted-foreground">
          Showing {rows.length} of {orgGoals.length}
        </div>
      </div>

      {view === "cards" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((g) => (
            <Link
              key={g.id}
              to="/smart-goals"
              search={{ orgGoalId: g.id }}
              className="group rounded-xl border bg-card p-5 shadow-sm transition hover:shadow-md hover:border-foreground/20"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{g.department}</p>
                  <h3 className="mt-1 text-base font-semibold leading-snug group-hover:underline">
                    {g.name}
                  </h3>
                </div>
                <StatusBadge value={g.status} />
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{g.description}</p>

              <div className="mt-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-2xl font-semibold leading-none">{g.computedProgress}%</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {g.smartCompleted} / {g.smartTotal} SMART goals completed
                  </p>
                </div>
                <div className="text-right text-[11px] text-muted-foreground">
                  <p>{g.startDate}</p>
                  <p>→ {g.endDate}</p>
                </div>
              </div>
              <Progress value={g.computedProgress} className="mt-3 h-1.5" />

              <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                <span>Owner · {g.owner}</span>
                <div className="flex items-center gap-2">
                  {profile && g.ownerId === profile.id && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          startEdit(g);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:bg-destructive/15 hover:text-destructive cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          deleteOrgGoal(g.id);
                          toast.success("Goal deleted successfully");
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  )}
                  <span className="text-foreground/70 group-hover:text-foreground">Open →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <SortHead label="Goal" k="name" sortKey={sortKey} sortAsc={sortAsc} onClick={toggleSort} />
                <SortHead label="Owner" k="owner" sortKey={sortKey} sortAsc={sortAsc} onClick={toggleSort} />
                <TableHead>SMART Goals</TableHead>
                <SortHead label="Progress" k="progress" sortKey={sortKey} sortAsc={sortAsc} onClick={toggleSort} />
                <SortHead label="Status" k="status" sortKey={sortKey} sortAsc={sortAsc} onClick={toggleSort} />
                <TableHead>Start</TableHead>
                <SortHead label="End" k="endDate" sortKey={sortKey} sortAsc={sortAsc} onClick={toggleSort} />
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((g) => (
                <TableRow 
                  key={g.id} 
                  className="cursor-pointer"
                  onClick={() => navigate({ to: "/smart-goals", search: { orgGoalId: g.id } })}
                >
                  <TableCell className="max-w-md">
                    <span className="font-medium hover:underline">{g.name}</span>
                    <div className="text-xs text-muted-foreground">{g.department}</div>
                  </TableCell>
                  <TableCell>{g.owner}</TableCell>
                  <TableCell className="text-sm">
                    <span className="font-medium">{g.smartCompleted}</span>
                    <span className="text-muted-foreground"> / {g.smartTotal} completed</span>
                  </TableCell>
                  <TableCell className="w-[180px]">
                    <div className="flex items-center gap-2">
                      <Progress value={g.computedProgress} className="h-1.5" />
                      <span className="w-9 text-xs text-muted-foreground">{g.computedProgress}%</span>
                    </div>
                  </TableCell>
                  <TableCell><StatusBadge value={g.status} /></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{g.startDate}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{g.endDate}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()} className="w-[100px]">
                    {profile && g.ownerId === profile.id ? (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                          onClick={() => startEdit(g)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                          onClick={() => {
                            deleteOrgGoal(g.id);
                            toast.success("Goal deleted successfully");
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground/50 font-medium">Read-only</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Goal Dialog */}
      <Dialog open={!!editingGoal} onOpenChange={(open) => !open && setEditingGoal(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <form onSubmit={handleEdit}>
            <DialogHeader>
              <DialogTitle>Edit Strategic Objective</DialogTitle>
              <DialogDescription>
                Update details for this high-level organizational goal.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-goal-name">Goal Name *</Label>
                <Input
                  id="edit-goal-name"
                  placeholder="e.g. Expand gross retention to 96%"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Department</Label>
                  <Select value={editDepartment} onValueChange={setEditDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Owner</Label>
                  <Input
                    value={editingGoal?.owner || ""}
                    disabled
                    className="bg-muted text-muted-foreground cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={editStatus} onValueChange={setEditStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {orgGoalStatuses.map((st) => (
                        <SelectItem key={st} value={st}>{st}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-goal-progress">Progress %</Label>
                  <Input
                    id="edit-goal-progress"
                    type="number"
                    min={0}
                    max={100}
                    value={editProgress}
                    onChange={(e) => setEditProgress(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-goal-start">Start Date</Label>
                  <Input
                    id="edit-goal-start"
                    type="date"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-goal-end">End Date</Label>
                  <Input
                    id="edit-goal-end"
                    type="date"
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-goal-desc">Description</Label>
                <Textarea
                  id="edit-goal-desc"
                  placeholder="Detail the target outcomes and high-level strategy..."
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
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
    </div>
  );
}

function SortHead({
  label, k, sortKey, sortAsc, onClick,
}: { label: string; k: SortKey; sortKey: SortKey; sortAsc: boolean; onClick: (k: SortKey) => void }) {
  const active = sortKey === k;
  return (
    <TableHead>
      <button
        type="button"
        onClick={() => onClick(k)}
        className="inline-flex items-center gap-1.5 text-xs font-medium hover:text-foreground cursor-pointer"
      >
        {label}
        <ArrowUpDown className={cn("h-3 w-3", active ? "text-foreground" : "text-muted-foreground/60", active && sortAsc && "rotate-180")} />
      </button>
    </TableHead>
  );
}
