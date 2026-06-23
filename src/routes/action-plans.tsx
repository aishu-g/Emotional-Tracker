import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import {
  AlertTriangle,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  Plus,
  Sparkles,
  Users,
  LayoutGrid,
  List,
  Trash2,
  Search,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/hooks/use-workspace-store";
import { toast } from "sonner";
import { z } from "zod";

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

const actionPlansSearchSchema = z.object({
  smartGoalId: z.string().optional(),
});

export const Route = createFileRoute("/action-plans")({
  validateSearch: (search) => actionPlansSearchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Action Plans — Northstar" },
      {
        name: "description",
        content:
          "Executive collaboration workspace for challenges, director solutions, and recommended next steps.",
      },
    ],
  }),
  component: ActionPlansPage,
});

type Severity = "Low" | "Medium" | "High" | "Critical";
type ChallengeStatus = "Open" | "Investigating" | "Resolved";

interface DirectorSolution {
  id: string;
  director: string;
  role: string;
  initials: string;
  submittedAt: string;
  solution: string;
  recommended?: boolean;
}

interface WorkspaceChallenge {
  id: string;
  actionItemId: string;
  title: string;
  description: string;
  severity: Severity;
  status: ChallengeStatus;
  raisedBy: string;
  raisedByRole: string;
  date: string;
  solutions: DirectorSolution[];
}

function severityStyles(sev: Severity) {
  switch (sev) {
    case "Critical":
      return "bg-destructive/10 text-destructive border-destructive/20";
    case "High":
      return "bg-warning/15 text-[color:oklch(0.45_0.12_70)] border-warning/30";
    case "Medium":
      return "bg-info/10 text-info border-info/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function initialsOf(name: string | undefined | null) {
  if (!name) return "??";
  return name
    .split(" ")
    .map((p) => p ? p[0] : "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function ActionPlansPage() {
  const { smartGoalId } = Route.useSearch();
  const [view, setView] = useState<"cards" | "table">("cards");

  const {
    orgGoals,
    smartGoals,
    actionItems,
    challenges,
    solutions,
    addChallenge,
    addSolution,
    deleteActionItem,
  } = useWorkspaceStore();

  const [activeActionId, setActiveActionId] = useState<string>("");

  useEffect(() => {
    if (smartGoalId) {
      const found = actionItems.find((ai) => ai.smartGoalId === smartGoalId);
      if (found) {
        setActiveActionId(found.id);
      } else if (actionItems.length > 0) {
        setActiveActionId(actionItems[0].id);
      }
    } else if (actionItems.length > 0 && !activeActionId) {
      // fallback to first item
      setActiveActionId(actionItems[0].id);
    }
  }, [smartGoalId, actionItems]);

  const [smartFilter, setSmartFilter] = useState<string>(smartGoalId || "all");

  useEffect(() => {
    if (smartGoalId) {
      setSmartFilter(smartGoalId);
    }
  }, [smartGoalId]);

  const action = useMemo(() => {
    return actionItems.find((ai) => ai.id === activeActionId) || actionItems[0] || {
      id: "",
      task: "No Active Task",
      assignedTo: "—",
      priority: "Medium",
      dueDate: "—",
      status: "Todo",
      progress: 0,
      smartGoalId: ""
    };
  }, [actionItems, activeActionId]);

  const smart = useMemo(() => {
    return smartGoals.find((s) => s.id === action.smartGoalId) || { id: "", title: "—", orgGoalId: "" };
  }, [action, smartGoals]);

  const org = useMemo(() => {
    return orgGoals.find((g) => g.id === smart.orgGoalId) || { id: "", name: "—" };
  }, [smart, orgGoals]);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredActionItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return actionItems.filter((ai) => {
      const matchesQuery = !q || ai.task.toLowerCase().includes(q) || ai.assignedTo.toLowerCase().includes(q);
      const matchesSmartGoal = smartFilter === "all" || ai.smartGoalId === smartFilter;
      const matchesStatus = statusFilter === "all" || ai.status === statusFilter;
      return matchesQuery && matchesSmartGoal && matchesStatus;
    });
  }, [actionItems, query, smartFilter, statusFilter]);

  const groupedActionItems = useMemo(() => {
    const map = new Map<string, typeof actionItems>();
    for (const ai of filteredActionItems) {
      if (!map.has(ai.smartGoalId)) {
        map.set(ai.smartGoalId, []);
      }
      map.get(ai.smartGoalId)!.push(ai);
    }
    return Array.from(map.entries()).map(([sgId, items]) => ({
      smartGoal: smartGoals.find((s) => s.id === sgId) || { id: sgId, title: "SMART Goal" },
      items,
    }));
  }, [filteredActionItems, smartGoals]);

  // Derived challengesList from unified store state
  const challengesList = useMemo(() => {
    if (!challenges) return [];
    return challenges.map((c) => {
      if (!c) return null;
      const matchingSolutions = (solutions || []).filter((s) => s && s.relatedChallengeId === c.id);
      
      const directorSolutions: DirectorSolution[] = matchingSolutions.map((s) => {
        let role = "Director";
        if (s.director === "Sarah Chen") role = "Chief Revenue Officer";
        else if (s.director === "Marcus Hill") role = "Chief Customer Officer";
        else if (s.director === "Priya Anand") role = "Chief Product Officer";
        else if (s.director === "Daniel Ortiz") role = "Chief Security Officer";
        else if (s.director === "Amelia Brooks") role = "Chief People Officer";
        else if (s.director === "Jordan Lee") role = "VP Customer Experience";
        else if (s.director === "Tomás Rivera") role = "VP Partnerships";
        else if (s.director === "Alex Kim") role = "Chief Operating Officer";

        return {
          id: s.id || `s-${Date.now()}`,
          director: s.director || "Unknown Director",
          role,
          initials: initialsOf(s.director),
          submittedAt: s.date || "Just now",
          solution: s.title || "No solution provided",
          recommended: s.impact >= 8,
        };
      });

      return {
        id: c.id,
        actionItemId: c.actionItemId || "",
        title: c.title || "Untitled Challenge",
        description: c.description || "",
        severity: (c.severity || "Medium") as Severity,
        status: (c.status || "Open") as ChallengeStatus,
        raisedBy: c.raisedBy || "Anonymous",
        raisedByRole: c.owner && c.raisedBy && c.owner === c.raisedBy ? "Goal Owner" : "Executive Advisor",
        date: c.createdAt || "Just now",
        solutions: directorSolutions,
      } as WorkspaceChallenge;
    }).filter(Boolean) as WorkspaceChallenge[];
  }, [challenges, solutions]);

  const activeChallenges = useMemo(() => {
    return challengesList.filter((c) => c.actionItemId === action.id);
  }, [challengesList, action.id]);

  const [selectedId, setSelectedId] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Automatically select first challenge of active action plan when it changes
  useEffect(() => {
    if (activeChallenges.length > 0) {
      setSelectedId(activeChallenges[0].id);
      setExpandedId(activeChallenges[0].id);
    } else {
      setSelectedId("");
      setExpandedId(null);
    }
  }, [action.id, activeChallenges.length]);

  const selected = useMemo(() => {
    return activeChallenges.find((c) => c.id === selectedId) || activeChallenges[0] || null;
  }, [activeChallenges, selectedId]);

  const recommended = selected?.solutions.find((s) => s.recommended) || null;
  const otherSolutions = selected?.solutions.filter((s) => !s.recommended) || [];

  const summary = useMemo(() => {
    const total = activeChallenges.length;
    const open = activeChallenges.filter((c) => c.status !== "Resolved").length;
    const solsCount = activeChallenges.reduce(
      (s, c) => s + c.solutions.length,
      0,
    );
    const recommendedCount = activeChallenges.reduce(
      (s, c) => s + c.solutions.filter((x) => x.recommended).length,
      0,
    );
    return { total, open, solutions: solsCount, recommendedCount };
  }, [activeChallenges]);

  // Invite Directors state
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Board Observer");

  // Rationale Modal state
  const [rationaleOpen, setRationaleOpen] = useState(false);
  const [rationaleSolution, setRationaleSolution] = useState<DirectorSolution | null>(null);

  // Form states for dynamic submission
  const [newChallenges, setNewChallenges] = useState<string[]>([]);
  const [newSolutions, setNewSolutions] = useState<string[]>([]);
  const [targetChallengeId, setTargetChallengeId] = useState<string>("");

  useEffect(() => {
    if (activeChallenges.length > 0) {
      const exists = activeChallenges.some((c) => c.id === targetChallengeId);
      if (!exists) {
        setTargetChallengeId(activeChallenges[0].id);
      }
    } else {
      setTargetChallengeId("");
    }
  }, [activeChallenges, targetChallengeId]);

  const handleAddChallengeInput = () => {
    setNewChallenges((prev) => [...prev, ""]);
  };

  const handleRemoveChallengeInput = (index: number) => {
    setNewChallenges((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChallengeChange = (index: number, val: string) => {
    setNewChallenges((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const handleAddSolutionInput = () => {
    setNewSolutions((prev) => [...prev, ""]);
  };

  const handleRemoveSolutionInput = (index: number) => {
    setNewSolutions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSolutionChange = (index: number, val: string) => {
    setNewSolutions((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const generateSimulatedSolutions = (title: string): Array<{ director: string; solution: string; recommended: boolean }> => {
    const directorsList = [
      "Priya Anand",
      "Marcus Hill",
      "Tomás Rivera",
      "Daniel Ortiz",
      "Sarah Chen",
      "Amelia Brooks",
      "Jordan Lee"
    ];

    // Pick 2 random unique directors
    const shuffled = [...directorsList].sort(() => 0.5 - Math.random());
    const selectedDirectors = shuffled.slice(0, 2);

    return selectedDirectors.map((dir, index) => {
      let solutionText = "";
      const lowerTitle = title.toLowerCase();
      
      if (lowerTitle.includes("scale") || lowerTitle.includes("hir") || lowerTitle.includes("team") || lowerTitle.includes("people")) {
        solutionText = `Let's fast-track headcount for this initiative. I recommend setting up a dedicated pod and partnering with external recruiting agencies to compress the hiring cycle.`;
      } else if (lowerTitle.includes("integrat") || lowerTitle.includes("partner") || lowerTitle.includes("ecosystem")) {
        solutionText = `We should leverage our tier-1 partners to co-sell and build pre-integrated templates that simplify this rollout for end customers.`;
      } else if (lowerTitle.includes("product") || lowerTitle.includes("feature") || lowerTitle.includes("slow") || lowerTitle.includes("latency")) {
        solutionText = `My team can allocate engineering cycles to build an optimization layer. We should target the bottleneck first and establish a weekly monitoring dashboard.`;
      } else if (lowerTitle.includes("sale") || lowerTitle.includes("revenue") || lowerTitle.includes("close") || lowerTitle.includes("deal")) {
        solutionText = `We need a dedicated executive sponsor assigned to each of these deals. We should also offer a structured pilot program to lower the initial barrier to entry.`;
      } else if (lowerTitle.includes("custom") || lowerTitle.includes("churn") || lowerTitle.includes("onboard")) {
        solutionText = `I suggest conducting post-onboarding interviews to identify friction points. We can also build a self-serve knowledge base to expedite user adoption.`;
      } else {
        const phrases = [
          `We should establish a cross-functional task force consisting of product, success, and enablement to address this within the next 30 days.`,
          `I recommend defining a clear set of KPIs and sharing a weekly progress report with the leadership team so we can adjust our resource allocation as needed.`,
          `Let's schedule a dedicated alignment workshop next week to draft a detailed action plan and assign named owners for each stream.`,
          `We should conduct a quick audit of our current processes to see where the bottlenecks are, then pilot a streamlined workflow in one region.`
        ];
        solutionText = phrases[index % phrases.length];
      }

      return {
        director: dir,
        solution: solutionText,
        recommended: index === 0
      };
    });
  };

  const handleChallengeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validChallenges = newChallenges.filter((t) => t.trim() !== "");
    if (validChallenges.length === 0) return;

    validChallenges.forEach((title) => {
      const cleanTitle = title.trim();
      const newCh = addChallenge({
        title: cleanTitle,
        description: "Raised via boardroom workspace.",
        relatedGoalId: action.smartGoalId,
        actionItemId: action.id,
        severity: "High",
        owner: "Alex Kim",
        raisedBy: "Alex Kim",
      });

      // Generate simulated solutions
      const generated = generateSimulatedSolutions(cleanTitle);
      generated.forEach((sol) => {
        addSolution({
          title: sol.solution,
          description: "Board recommendation rationale.",
          relatedChallengeId: newCh.id,
          director: sol.director,
          impact: sol.recommended ? 8 : 6,
          owner: sol.director,
        });
      });
    });

    toast.success("Challenges raised and advisor feedback simulated!");
    setNewChallenges([]);
  };

  const handleSolutionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validSolutions = newSolutions.filter((s) => s.trim() !== "");
    if (validSolutions.length === 0) return;

    validSolutions.forEach((text) => {
      addSolution({
        title: text.trim(),
        description: "Executive solution proposal.",
        relatedChallengeId: targetChallengeId,
        director: "Alex Kim",
        impact: 7,
        owner: "Alex Kim",
      });
    });

    toast.success("Proposed solution successfully!");
    setNewSolutions([]);
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    toast.success(`Invite sent successfully to ${inviteEmail} as ${inviteRole}!`);
    setInviteEmail("");
    setInviteOpen(false);
  };

  const handleViewRationale = (sol: DirectorSolution) => {
    setRationaleSolution(sol);
    setRationaleOpen(true);
  };

  return (
    <div className="space-y-6 p-6 md:p-8">
      <PageHeader
        title="Action Plans"
        description="Executive collaboration workspace — manage tasks, review challenges, weigh director input, and align on recommended paths."
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
            
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="cursor-pointer">
                  <Users className="mr-1.5 h-4 w-4" /> Invite directors
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[420px]">
                <form onSubmit={handleInvite}>
                  <DialogHeader>
                    <DialogTitle>Invite Executive Advisors</DialogTitle>
                    <DialogDescription>
                      Share this boardroom workspace with directors to request solutions and feedback.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="invite-email">Email Address</Label>
                      <Input
                        id="invite-email"
                        type="email"
                        placeholder="e.g. director@company.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Advisory Role</Label>
                      <Select value={inviteRole} onValueChange={setInviteRole}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Executive Advisor">Executive Advisor</SelectItem>
                          <SelectItem value="Board Observer">Board Observer</SelectItem>
                          <SelectItem value="External Consultant">External Consultant</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline" type="button" className="cursor-pointer">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" className="cursor-pointer">Send Invitation</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Filter controls */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search action plans…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 pl-9"
          />
        </div>
        <Select value={smartFilter} onValueChange={setSmartFilter}>
          <SelectTrigger className="h-9 w-[240px]">
            <SelectValue placeholder="All SMART goals" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All SMART goals</SelectItem>
            {smartGoals.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="Todo">Todo</SelectItem>
            <SelectItem value="Doing">Doing</SelectItem>
            <SelectItem value="Blocked">Blocked</SelectItem>
            <SelectItem value="Done">Done</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {view === "cards" ? (
        /* Grouped Cards Grid */
        <div className="space-y-8">
          {groupedActionItems.map(({ smartGoal, items }) => (
            <section key={smartGoal.id} className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">SMART Goal</span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-semibold text-foreground">{smartGoal.title}</span>
                <span className="ml-2 text-xs text-muted-foreground">{items.length} action plans</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items.map((ai) => {
                  const isActive = ai.id === activeActionId;
                  return (
                    <div
                      key={ai.id}
                      onClick={() => setActiveActionId(ai.id)}
                      className={cn(
                        "group rounded-xl border bg-card p-5 text-left shadow-sm transition hover:shadow-md cursor-pointer",
                        isActive
                          ? "border-primary shadow-md ring-1 ring-primary"
                          : "hover:border-foreground/15"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold leading-snug group-hover:underline">{ai.task}</p>
                        <StatusBadge value={ai.status} />
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <Progress value={ai.progress} className="h-1.5" />
                        <span className="w-9 text-xs text-muted-foreground">{ai.progress}%</span>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                              {initialsOf(ai.assignedTo)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-foreground">{ai.assignedTo}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 font-medium">
                            Priority: <StatusBadge value={ai.priority} />
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive hover:bg-destructive/15 hover:text-destructive cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteActionItem(ai.id);
                              toast.success("Action plan deleted successfully");
                              if (isActive) setActiveActionId("");
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
          {groupedActionItems.length === 0 && (
            <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
              No action plans match the current filters.
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Action Plan / Task</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>SMART Goal</TableHead>
                <TableHead>Notes / Comment</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActionItems.map((ai) => {
                const smartGoal = smartGoals.find((sg) => sg.id === ai.smartGoalId);
                const isActive = ai.id === activeActionId;
                return (
                  <TableRow
                    key={ai.id}
                    onClick={() => setActiveActionId(ai.id)}
                    className={cn(
                      "cursor-pointer transition-colors",
                      isActive
                        ? "bg-primary/5 hover:bg-primary/5 border-l-2 border-l-primary"
                        : ""
                    )}
                  >
                    <TableCell className="font-medium">
                      <div>{ai.task}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        ID: {ai.id.toUpperCase()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                            {initialsOf(ai.assignedTo)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs">{ai.assignedTo}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={ai.priority} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={ai.status} />
                    </TableCell>
                    <TableCell className="w-[180px]">
                      <div className="flex items-center gap-2">
                        <Progress value={ai.progress} className="h-1.5" />
                        <span className="w-9 text-xs text-muted-foreground">{ai.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{ai.dueDate}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                      {smartGoal ? smartGoal.title : "—"}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground text-wrap">
                      {ai.comment || "—"}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                        onClick={() => {
                          deleteActionItem(ai.id);
                          toast.success("Action plan deleted successfully");
                          if (isActive) setActiveActionId("");
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredActionItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    No action plans match the current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* COLLABORATION WORKSPACE FOR SELECTED ACTION PLAN */}
      {action.id ? (
        <div className="mt-12 space-y-6 pt-6 border-t">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Collaboration Workspace</h2>
              <p className="text-sm text-muted-foreground">
                Active task: <span className="font-semibold text-foreground">{action.task}</span> (linked to <span className="italic">{smart.title}</span>)
              </p>
            </div>
            <div className="flex items-center gap-3 self-start md:self-auto">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="font-medium">Due Date:</span>
                <span className="font-semibold text-foreground">{action.dueDate}</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                    {initialsOf(action.assignedTo)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-semibold">{action.assignedTo}</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20 cursor-pointer gap-1.5 h-8"
                onClick={() => {
                  deleteActionItem(action.id);
                  toast.success("Action plan deleted successfully");
                  setActiveActionId("");
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Task
              </Button>
            </div>
          </div>

          {/* Summary KPI strip for the active action plan */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              label="Total Challenges"
              value={summary.total}
              icon={AlertTriangle}
              tone="default"
            />
            <SummaryCard
              label="Open Challenges"
              value={summary.open}
              icon={TrendingUp}
              tone="warning"
            />
            <SummaryCard
              label="Solutions Submitted"
              value={summary.solutions}
              icon={Lightbulb}
              tone="info"
            />
            <SummaryCard
              label="Recommended Solutions"
              value={summary.recommendedCount}
              icon={Sparkles}
              tone="primary"
            />
          </div>

          {/* 2-Column workspace layout: Challenges on Left, Solutions on Right */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Column: Challenges */}
            <section className="rounded-2xl border bg-card shadow-sm flex flex-col">
              <div className="flex items-center justify-between border-b px-5 py-4">
                <div>
                  <h3 className="text-sm font-semibold tracking-tight">Challenges & Pain Points</h3>
                  <p className="text-xs text-muted-foreground">Surfaced blocker items for this task</p>
                </div>
                <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-semibold text-primary">
                  {activeChallenges.length}
                </span>
              </div>

              <ScrollArea className="h-[400px]">
                <div className="space-y-3 p-4">
                  {activeChallenges.map((c) => {
                    const isSelected = c.id === selectedId;
                    const isExpanded = c.id === expandedId;
                    return (
                      <article
                        key={c.id}
                        className={cn(
                          "group rounded-xl border bg-card transition-all",
                          isSelected
                            ? "border-primary/45 shadow-[0_0_0_3px_oklch(var(--primary)/0.06)]"
                            : "hover:border-foreground/15 hover:shadow-sm"
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedId(c.id);
                            setExpandedId(isExpanded ? null : c.id);
                          }}
                          className="w-full px-4 py-4 text-left cursor-pointer"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                                    severityStyles(c.severity)
                                  )}
                                >
                                  {c.severity}
                                </span>
                                <StatusBadge value={c.status} />
                              </div>
                              <h4 className="mt-2 text-sm font-semibold leading-snug">{c.title}</h4>
                            </div>
                            {isExpanded ? (
                              <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                            )}
                          </div>

                          {isExpanded && (
                            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                              {c.description}
                            </p>
                          )}

                          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-5 w-5">
                                <AvatarFallback className="bg-secondary text-[9px] font-medium">
                                  {initialsOf(c.raisedBy)}
                                </AvatarFallback>
                              </Avatar>
                              <span>
                                <span className="font-medium text-foreground">{c.raisedBy}</span> · {c.raisedByRole}
                              </span>
                            </div>
                            <span className="inline-flex items-center gap-1">
                              <CalendarDays className="h-3 w-3" />
                              {c.date}
                            </span>
                          </div>
                        </button>
                      </article>
                    );
                  })}
                  {activeChallenges.length === 0 && (
                    <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 bg-muted/20 h-[300px]">
                      <AlertTriangle className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium text-muted-foreground text-center">No active challenges raised for this plan.</p>
                      <p className="text-xs text-muted-foreground mt-1 text-center">Use the boardroom input forms below to raise the first challenge.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </section>

            {/* Right Column: Director Solutions */}
            <section className="rounded-2xl border bg-card shadow-sm flex flex-col">
              <div className="border-b px-5 py-4">
                <h3 className="text-sm font-semibold tracking-tight">Director Solutions & Feedback</h3>
                <p className="text-xs text-muted-foreground">Boardroom recommendations & active responses</p>
              </div>

              {selected ? (
                <>
                  <div className="border-b bg-muted/30 px-5 py-3">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Discussing</p>
                    <p className="mt-1 text-sm font-semibold leading-snug">{selected.title}</p>
                  </div>

                  <ScrollArea className="h-[338px]">
                    <div className="space-y-4 p-4">
                      {recommended && (
                        <RecommendedCard
                          solution={recommended}
                          onViewRationale={() => handleViewRationale(recommended)}
                        />
                      )}
                      {otherSolutions.length > 0 && (
                        <p className="px-1 pt-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                          Other recommendations
                        </p>
                      )}
                      {otherSolutions.map((s) => (
                        <SolutionCard
                          key={s.id}
                          solution={s}
                          onViewRationale={() => handleViewRationale(s)}
                        />
                      ))}
                      {selected.solutions.length === 0 && (
                        <p className="text-sm text-muted-foreground italic text-center py-8">No solutions submitted yet.</p>
                      )}
                    </div>
                  </ScrollArea>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 bg-muted/10 flex-1 min-h-[300px]">
                  <Lightbulb className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium text-muted-foreground text-center">No challenge selected.</p>
                  <p className="text-xs text-muted-foreground mt-1 text-center">Select an active challenge on the left to see submitted director solutions.</p>
                </div>
              )}
            </section>
          </div>

          {/* Dynamic Boardroom Activity: Raise Challenges & Propose Solutions */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Card 1: Raise Challenges */}
            <div className="rounded-2xl border bg-card p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <div>
                      <h3 className="text-sm font-semibold tracking-tight">Raise Boardroom Challenges</h3>
                      <p className="text-xs text-muted-foreground">Identify critical blockers for executive attention</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddChallengeInput}
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-4">
                  {newChallenges.length === 0 ? (
                    <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 bg-muted/20">
                      <AlertTriangle className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-xs text-muted-foreground text-center">No challenges staged. Click the <span className="font-semibold">+</span> button to begin.</p>
                      <Button 
                        type="button" 
                        onClick={handleAddChallengeInput} 
                        variant="outline" 
                        size="sm" 
                        className="mt-4 gap-1.5 h-8 text-xs cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" /> Stage Challenge
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleChallengeSubmit} className="space-y-4">
                      <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
                        {newChallenges.map((challenge, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-muted-foreground w-4">{idx + 1}.</span>
                            <Input
                              placeholder="Describe the challenge..."
                              value={challenge}
                              onChange={(e) => handleChallengeChange(idx, e.target.value)}
                              className="h-9 flex-1 text-xs"
                              required
                            />
                            <Button
                              type="button"
                              onClick={() => handleRemoveChallengeInput(idx)}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex justify-between items-center pt-2 border-t">
                        <Button
                          type="button"
                          onClick={handleAddChallengeInput}
                          variant="ghost"
                          size="sm"
                          className="text-xs h-8 gap-1 cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" /> Add another
                        </Button>
                        <Button type="submit" size="sm" className="text-xs h-8 cursor-pointer">
                          Submit & Simulate Solutions
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>

            {/* Card 2: Propose Solutions */}
            <div className="rounded-2xl border bg-card p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-warning" />
                    <div>
                      <h3 className="text-sm font-semibold tracking-tight">Propose Executive Solutions</h3>
                      <p className="text-xs text-muted-foreground">Deliver constructive recommendations to active challenges</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddSolutionInput}
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-4">
                  {activeChallenges.length === 0 ? (
                    <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 bg-muted/20">
                      <AlertTriangle className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-xs text-muted-foreground text-center">No challenges exist for this action plan. Raise a challenge first to propose solutions.</p>
                    </div>
                  ) : newSolutions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 bg-muted/20">
                      <Lightbulb className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-xs text-muted-foreground text-center">No solutions staged. Click the <span className="font-semibold">+</span> button to begin.</p>
                      <Button 
                        type="button" 
                        onClick={handleAddSolutionInput} 
                        variant="outline" 
                        size="sm" 
                        className="mt-4 gap-1.5 h-8 text-xs cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" /> Stage Solution
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSolutionSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Select Target Challenge</label>
                        <Select value={targetChallengeId} onValueChange={setTargetChallengeId}>
                          <SelectTrigger className="h-9 w-full bg-background text-xs">
                            <SelectValue placeholder="Select target challenge" />
                          </SelectTrigger>
                          <SelectContent>
                            {activeChallenges.map((c) => (
                              <SelectItem key={c.id} value={c.id} className="text-xs">
                                {c.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
                        {newSolutions.map((sol, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-muted-foreground w-4">{idx + 1}.</span>
                            <Input
                              placeholder="Type solution recommendation..."
                              value={sol}
                              onChange={(e) => handleSolutionChange(idx, e.target.value)}
                              className="h-9 flex-1 text-xs"
                              required
                            />
                            <Button
                              type="button"
                              onClick={() => handleRemoveSolutionInput(idx)}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex justify-between items-center pt-2 border-t">
                        <Button
                          type="button"
                          onClick={handleAddSolutionInput}
                          variant="ghost"
                          size="sm"
                          className="text-xs h-8 gap-1 cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" /> Add another
                        </Button>
                        <Button type="submit" size="sm" className="text-xs h-8 cursor-pointer">
                          Propose Solutions
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-sm text-muted-foreground">Select an action plan to load the collaboration workspace.</div>
      )}

      {/* Rationale Modal Dialog */}
      <Dialog open={rationaleOpen} onOpenChange={setRationaleOpen}>
        <DialogContent className="sm:max-w-[480px]">
          {rationaleSolution && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {rationaleSolution.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <DialogTitle className="text-sm font-semibold">{rationaleSolution.director}</DialogTitle>
                    <DialogDescription className="text-xs">{rationaleSolution.role}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-4 text-left">
                <div className="rounded-lg border bg-muted/20 p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Proposed Recommendation</h4>
                  <p className="mt-1.5 text-sm font-medium text-foreground leading-normal">{rationaleSolution.solution}</p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Strategic Justification</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Implementing this solution resolves the critical blocker by immediately addressing the core friction. 
                    Based on historical department metrics, aligning C-suite sponsors with targeted workflows reduces project 
                    turnaround times by roughly 30%. This approach limits overhead and allows resources to stay focused on product QA 
                    while maintaining a clear timeline for executive updates.
                  </p>
                </div>
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" size="sm" className="cursor-pointer">Close</Button>
                </DialogClose>
                <Button size="sm" onClick={() => {
                  toast.success("Aligned on this rationale!");
                  setRationaleOpen(false);
                }} className="cursor-pointer">Align on solution</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------- Sub-components ----------
function SummaryCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  tone: "default" | "warning" | "info" | "primary";
}) {
  const toneClass = {
    default: "bg-muted text-foreground",
    warning: "bg-warning/15 text-[color:oklch(0.45_0.12_70)]",
    info: "bg-info/10 text-info",
    primary: "bg-primary/10 text-primary",
  }[tone];
  return (
    <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm">
      <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", toneClass)}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-2xl font-semibold tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function RecommendedCard({
  solution,
  onViewRationale,
}: {
  solution: DirectorSolution;
  onViewRationale: () => void;
}) {
  return (
    <article className="relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-br from-primary/5 via-card to-card p-5 shadow-sm">
      <div className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground shadow-sm">
        <Sparkles className="h-3 w-3" />
        Recommended
      </div>
      <div className="flex items-center gap-3 pr-28">
        <Avatar className="h-10 w-10 ring-2 ring-primary/20">
          <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
            {solution.initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-tight">{solution.director}</p>
          <p className="text-xs text-muted-foreground">{solution.role}</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-foreground/90">
        {solution.solution}
      </p>
      <div className="mt-4 flex items-center justify-between border-t border-primary/10 pt-3 text-xs text-muted-foreground">
        <span>Submitted {solution.submittedAt}</span>
        <Button size="sm" variant="outline" onClick={onViewRationale} className="h-7 text-xs cursor-pointer">
          View rationale
        </Button>
      </div>
    </article>
  );
}

function SolutionCard({
  solution,
  onViewRationale,
}: {
  solution: DirectorSolution;
  onViewRationale: () => void;
}) {
  return (
    <article className="rounded-xl border bg-card p-4 transition-shadow hover:shadow-sm">
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-secondary text-xs font-semibold">
            {solution.initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-tight">{solution.director}</p>
          <p className="text-xs text-muted-foreground">{solution.role}</p>
        </div>
        <span className="text-[11px] text-muted-foreground">{solution.submittedAt}</span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-foreground/80">
        {solution.solution}
      </p>
      <div className="mt-3 flex justify-end">
        <Button size="sm" variant="ghost" onClick={onViewRationale} className="h-7 px-2 text-[10px] font-medium text-primary hover:bg-primary/5 cursor-pointer">
          See rationale
        </Button>
      </div>
    </article>
  );
}
