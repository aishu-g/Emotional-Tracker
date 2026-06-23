import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Lightbulb, LayoutGrid, List, Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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

export const Route = createFileRoute("/solutions")({
  head: () => ({
    meta: [
      { title: "Solutions — PB39" },
      { name: "description", content: "Library of proposed and implemented solutions across your organization." },
    ],
  }),
  component: SolutionsPage,
});

function initials(n: string) { return n.split(" ").map(p => p[0]).slice(0,2).join("").toUpperCase(); }

function SolutionsPage() {
  const {
    solutions,
    challenges,
    profile,
    addSolution,
  } = useWorkspaceStore();

  const [view, setView] = useState<"cards" | "table">("cards");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [relatedChallengeId, setRelatedChallengeId] = useState("");
  const [impact, setImpact] = useState("7");

  const chTitle = (id: string) => challenges.find(c => c.id === id)?.title ?? "—";

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !relatedChallengeId) {
      toast.error("Please fill in required fields.");
      return;
    }

    addSolution({
      title,
      description,
      relatedChallengeId,
      impact: Number(impact),
      director: profile.name,
      owner: profile.name,
    });

    toast.success(`Solution proposal "${title}" submitted!`);
    setTitle("");
    setDescription("");
    setRelatedChallengeId("");
    setImpact("7");
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6 p-6 md:p-8">
      <PageHeader
        title="Solutions"
        description="A repository of fixes — proposed, in review and implemented."
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
                  Propose solution
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px]">
                <form onSubmit={handleCreate}>
                  <DialogHeader>
                    <DialogTitle>Propose Boardroom Solution</DialogTitle>
                    <DialogDescription>
                      Deliver constructive recommendations and strategies to resolve active challenges.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    <div className="space-y-1.5">
                      <Label>Target Challenge *</Label>
                      <Select value={relatedChallengeId} onValueChange={setRelatedChallengeId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select target challenge" />
                        </SelectTrigger>
                        <SelectContent>
                          {challenges.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.title} ({c.severity})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="sol-title">Solution Headline *</Label>
                      <Input
                        id="sol-title"
                        placeholder="e.g. Outsource translation tasks to agency"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Impact Score (1-10)</Label>
                        <Select value={impact} onValueChange={setImpact}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[...Array(10)].map((_, i) => (
                              <SelectItem key={i + 1} value={String(i + 1)}>
                                {i + 1} / 10
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Director / Proposer</Label>
                        <Input value={profile.name} disabled className="bg-muted/50" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="sol-desc">Detailed Description</Label>
                      <Textarea
                        id="sol-desc"
                        placeholder="Outline implementation plan, cost estimate, and expected ROI..."
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
                    <Button type="submit" className="cursor-pointer">Propose Solution</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {view === "cards" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {solutions.map((s) => (
            <article key={s.id} className="flex flex-col rounded-xl border bg-card p-5 transition hover:shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Lightbulb className="h-4 w-4" />
                </div>
                <StatusBadge value={s.status} />
              </div>
              <h3 className="mt-3 font-semibold leading-snug">{s.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Addresses: <span className="text-foreground">{chTitle(s.relatedChallengeId)}</span>
              </p>
              <div className="mt-4 rounded-lg border p-3">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Impact score</span>
                  <span className="text-sm font-semibold">{s.impact}/10</span>
                </div>
                <Progress value={s.impact * 10} className="h-1.5" />
              </div>
              <div className="mt-auto flex items-center gap-2 pt-4">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-primary/10 text-primary text-[10px]">{initials(s.owner)}</AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">{s.owner}</span>
              </div>
            </article>
          ))}
          {solutions.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-12 col-span-full">No solutions submitted yet.</p>
          )}
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Solution</TableHead>
                <TableHead>Impact Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Director</TableHead>
                <TableHead>Date Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {solutions.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">
                    <div>{s.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Addresses: {chTitle(s.relatedChallengeId)}
                    </div>
                  </TableCell>
                  <TableCell className="w-[180px]">
                    <div className="flex items-center gap-2">
                      <Progress value={s.impact * 10} className="h-1.5" />
                      <span className="w-9 text-xs text-muted-foreground">{s.impact}/10</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge value={s.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                          {initials(s.owner)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs">{s.owner}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">{s.director}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{s.date}</TableCell>
                </TableRow>
              ))}
              {solutions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No solutions submitted yet.
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
