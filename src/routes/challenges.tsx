import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, LayoutGrid, List, Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useWorkspaceStore } from "@/hooks/use-workspace-store";
import { cn } from "@/lib/utils";
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/challenges")({
  head: () => ({
    meta: [
      { title: "Challenges — PB39" },
      { name: "description", content: "Surface blockers, assign owners and track resolution across your goals." },
    ],
  }),
  component: ChallengesPage,
});

function initials(n: string) { return n.split(" ").map(p => p[0]).slice(0,2).join("").toUpperCase(); }

function ChallengesPage() {
  const {
    challenges,
    orgGoals,
    smartGoals,
    actionItems,
    profile,
    addChallenge,
  } = useWorkspaceStore();

  const [view, setView] = useState<"cards" | "table">("cards");
  const [tab, setTab] = useState<"all" | "Open" | "Investigating" | "Resolved">("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<"Low" | "Medium" | "High" | "Critical">("High");
  const [actionItemId, setActionItemId] = useState("");

  const goalName = (id: string) => orgGoals.find(g => g.id === id)?.name ?? "—";

  const filtered = tab === "all" ? challenges : challenges.filter(c => c.status === tab);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !actionItemId) {
      toast.error("Please fill in required fields.");
      return;
    }

    const selectedAction = actionItems.find((ai) => ai.id === actionItemId);
    const selectedSmart = smartGoals.find((sg) => sg.id === selectedAction?.smartGoalId);
    const relatedGoalId = selectedSmart?.orgGoalId || "";

    addChallenge({
      title,
      description,
      relatedGoalId,
      actionItemId,
      severity,
      owner: profile.name,
      raisedBy: profile.name,
    });

    toast.success(`Challenge "${title}" raised successfully!`);
    setTitle("");
    setDescription("");
    setActionItemId("");
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6 p-6 md:p-8">
      <PageHeader
        title="Challenges"
        description="Issues blocking goal progress — investigated, owned and resolved."
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

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="cursor-pointer gap-1">
                  <Plus className="h-3.5 w-3.5" />
                  Raise challenge
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px]">
                <form onSubmit={handleCreate}>
                  <DialogHeader>
                    <DialogTitle>Raise Boardroom Challenge</DialogTitle>
                    <DialogDescription>
                      Surface a blocker or risk affecting an active action plan task.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    <div className="space-y-1.5">
                      <Label>Blocked Action Plan / Task *</Label>
                      <Select value={actionItemId} onValueChange={setActionItemId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select blocked task" />
                        </SelectTrigger>
                        <SelectContent>
                          {actionItems.map((ai) => (
                            <SelectItem key={ai.id} value={ai.id}>
                              {ai.task} ({ai.assignedTo})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="ch-title">Challenge Summary *</Label>
                      <Input
                        id="ch-title"
                        placeholder="e.g. Critical localization resource missing"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Severity</Label>
                        <Select value={severity} onValueChange={(val) => setSeverity(val as any)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Raised By</Label>
                        <Input value={profile.name} disabled className="bg-muted/50" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="ch-desc">Detailed Description</Label>
                      <Textarea
                        id="ch-desc"
                        placeholder="Describe the blocker details, impact, and timeline..."
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
                    <Button type="submit" className="cursor-pointer">Raise Challenge</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="all" className="cursor-pointer">All <span className="ml-1.5 text-muted-foreground">{challenges.length}</span></TabsTrigger>
          <TabsTrigger value="Open" className="cursor-pointer">Open</TabsTrigger>
          <TabsTrigger value="Investigating" className="cursor-pointer">Investigating</TabsTrigger>
          <TabsTrigger value="Resolved" className="cursor-pointer">Resolved</TabsTrigger>
        </TabsList>
      </Tabs>

      {view === "cards" ? (
        <div className="overflow-hidden rounded-xl border bg-card">
          <ul className="divide-y">
            {filtered.map((c) => (
              <li key={c.id} className="flex flex-col gap-3 p-4 transition hover:bg-muted/30 md:flex-row md:items-center md:gap-6">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium leading-snug">{c.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Related to <span className="text-foreground">{goalName(c.relatedGoalId)}</span> · raised {c.createdAt}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge value={c.severity} />
                  <StatusBadge value={c.status} />
                  <div className="flex items-center gap-2 pl-2">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px]">{initials(c.owner)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{c.owner}</span>
                  </div>
                </div>
              </li>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-12">No challenges match the active status tab.</p>
            )}
          </ul>
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Challenge</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Raised By</TableHead>
                <TableHead>Date Raised</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    <div>{c.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Related to: {goalName(c.relatedGoalId)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge value={c.severity} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge value={c.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                          {initials(c.owner)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs">{c.owner}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">{c.raisedBy}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{c.createdAt}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No challenges match the current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
