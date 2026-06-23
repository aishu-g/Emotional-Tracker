import { useState } from "react";
import { Bell, Search, Plus, Sparkles, Check, CheckCircle2, Target, ListTodo, AlertTriangle, Lightbulb, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useNavigate, useLocation, useRouter } from "@tanstack/react-router";
import { useWorkspaceStore } from "@/hooks/use-workspace-store";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

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

// Popover components
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// DropdownMenu components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Select components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function TopBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.history.back();
    } else {
      navigate({ to: "/" });
    }
  };

  const {
    profile,
    orgGoals,
    smartGoals,
    activities,
    addOrgGoal,
    addSmartGoal,
    addActionItem,
    resetStore,
    departments,
  } = useWorkspaceStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [goalType, setGoalType] = useState<"org" | "smart" | "action">("org");

  // Form states
  // Org Goal Form
  const [orgName, setOrgName] = useState("");
  const [orgDept, setOrgDept] = useState("Revenue");
  const [orgOwner, setOrgOwner] = useState("");
  const [orgStart, setOrgStart] = useState("2026-01-01");
  const [orgEnd, setOrgEnd] = useState("2026-12-31");
  const [orgDesc, setOrgDesc] = useState("");

  // SMART Goal Form
  const [smartTitle, setSmartTitle] = useState("");
  const [smartOwner, setSmartOwner] = useState("");
  const [smartStart, setSmartStart] = useState("2026-06-01");
  const [smartEnd, setSmartEnd] = useState("2026-09-30");
  const [parentId, setParentId] = useState("");

  // Action Item Form
  const [actionTask, setActionTask] = useState("");
  const [actionAssignee, setActionAssignee] = useState("");
  const [actionPriority, setActionPriority] = useState<"Low" | "Medium" | "High" | "Urgent">("Medium");
  const [actionDue, setActionDue] = useState("2026-07-31");
  const [actionSmartId, setActionSmartId] = useState("");

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();

    if (goalType === "org") {
      if (!orgName || !orgOwner) {
        toast.error("Please fill in required fields.");
        return;
      }
      const added = await addOrgGoal({
        name: orgName,
        owner: orgOwner,
        department: orgDept,
        startDate: orgStart,
        endDate: orgEnd,
        description: orgDesc,
      });
      if (added) {
        toast.success(`Organization goal "${added.name}" created!`);
      } else {
        toast.error("Failed to create organization goal in database.");
      }
      // Reset
      setOrgName("");
      setOrgOwner("");
      setOrgDesc("");
    } else if (goalType === "smart") {
      if (!smartTitle || !smartOwner || !parentId) {
        toast.error("Please select a parent organization goal and fill in required fields.");
        return;
      }
      const added = await addSmartGoal({
        title: smartTitle,
        owner: smartOwner,
        startDate: smartStart,
        dueDate: smartEnd,
        orgGoalId: parentId,
      });
      if (added) {
        toast.success(`SMART goal "${added.title}" created!`);
      } else {
        toast.error("Failed to create SMART goal in database.");
      }
      // Reset
      setSmartTitle("");
      setSmartOwner("");
    } else if (goalType === "action") {
      if (!actionTask || !actionAssignee || !actionSmartId) {
        toast.error("Please select a parent SMART goal and fill in required fields.");
        return;
      }
      const added = await addActionItem({
        task: actionTask,
        assignedTo: actionAssignee,
        priority: actionPriority,
        dueDate: actionDue,
        smartGoalId: actionSmartId,
      });
      if (added) {
        toast.success(`Action Item "${added.task}" assigned to ${added.assignedTo}!`);
      } else {
        toast.error("Failed to create Action Item in database.");
      }
      // Reset
      setActionTask("");
      setActionAssignee("");
    }

    setDialogOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "goal_update":
        return <Target className="h-3.5 w-3.5 text-primary" />;
      case "new_challenge":
        return <AlertTriangle className="h-3.5 w-3.5 text-destructive" />;
      case "completed_action":
        return <CheckCircle2 className="h-3.5 w-3.5 text-success" />;
      case "solution_added":
        return <Lightbulb className="h-3.5 w-3.5 text-warning" />;
      default:
        return <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-5" />
      <Button
        variant="ghost"
        size="icon"
        onClick={handleBack}
        className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
        aria-label="Go back"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Separator orientation="vertical" className="h-5" />
      
      <div className="relative hidden flex-1 max-w-md md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search goals, challenges, people…"
          className="h-9 pl-9 bg-muted/40 border-transparent focus-visible:bg-background"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Create Goal Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-9 gap-1.5 cursor-pointer">
              <Plus className="h-4 w-4" />
              New goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <form onSubmit={handleCreateGoal}>
              <DialogHeader>
                <DialogTitle>Create Workspace Element</DialogTitle>
                <DialogDescription>
                  Add a new objective, measurable goal, or direct action plan to your workspace.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Element Type</Label>
                  <Select
                    value={goalType}
                    onValueChange={(val) => setGoalType(val as any)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="org">Organization Goal (Strategic Objective)</SelectItem>
                      <SelectItem value="smart">SMART Goal (Measurable Target)</SelectItem>
                      <SelectItem value="action">Action Item (Tactical Task)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Organization Goal Form */}
                {goalType === "org" && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="org-name">Goal Name *</Label>
                      <Input
                        id="org-name"
                        placeholder="e.g. Double market share in LATAM"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Department</Label>
                        <Select value={orgDept} onValueChange={setOrgDept}>
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
                        <Label htmlFor="org-owner">Owner *</Label>
                        <Input
                          id="org-owner"
                          placeholder="e.g. Sarah Chen"
                          value={orgOwner}
                          onChange={(e) => setOrgOwner(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="org-start">Start Date</Label>
                        <Input
                          id="org-start"
                          type="date"
                          value={orgStart}
                          onChange={(e) => setOrgStart(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="org-end">End Date</Label>
                        <Input
                          id="org-end"
                          type="date"
                          value={orgEnd}
                          onChange={(e) => setOrgEnd(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="org-desc">Description</Label>
                      <Textarea
                        id="org-desc"
                        placeholder="Brief summary of the strategic alignment..."
                        value={orgDesc}
                        onChange={(e) => setOrgDesc(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                {/* SMART Goal Form */}
                {goalType === "smart" && (
                  <div className="space-y-3">
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
                      <Label htmlFor="smart-title">SMART Goal Title *</Label>
                      <Input
                        id="smart-title"
                        placeholder="e.g. Onboard 15 LATAM channel partners"
                        value={smartTitle}
                        onChange={(e) => setSmartTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="smart-owner">Owner *</Label>
                      <Input
                        id="smart-owner"
                        placeholder="e.g. Tomás Rivera"
                        value={smartOwner}
                        onChange={(e) => setSmartOwner(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="smart-start">Start Date</Label>
                        <Input
                          id="smart-start"
                          type="date"
                          value={smartStart}
                          onChange={(e) => setSmartStart(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="smart-due">Due Date</Label>
                        <Input
                          id="smart-due"
                          type="date"
                          value={smartEnd}
                          onChange={(e) => setSmartEnd(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Item Form */}
                {goalType === "action" && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label>Parent SMART Goal *</Label>
                      <Select value={actionSmartId} onValueChange={setActionSmartId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select target measurable goal" />
                        </SelectTrigger>
                        <SelectContent>
                          {smartGoals.map((sg) => (
                            <SelectItem key={sg.id} value={sg.id}>
                              {sg.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="action-task">Task Description *</Label>
                      <Input
                        id="action-task"
                        placeholder="e.g. Standardize reseller contract drafts"
                        value={actionTask}
                        onChange={(e) => setActionTask(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Priority</Label>
                        <Select
                          value={actionPriority}
                          onValueChange={(val) => setActionPriority(val as any)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="action-assignee">Assigned To *</Label>
                        <Input
                          id="action-assignee"
                          placeholder="e.g. Lena Park"
                          value={actionAssignee}
                          onChange={(e) => setActionAssignee(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="action-due">Due Date</Label>
                      <Input
                        id="action-due"
                        type="date"
                        value={actionDue}
                        onChange={(e) => setActionDue(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" type="button" className="cursor-pointer">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" className="cursor-pointer">Create</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Notifications Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button size="icon" variant="ghost" className="h-9 w-9 relative cursor-pointer">
              <Bell className="h-4 w-4" />
              {activities.length > 0 && (
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="border-b px-4 py-3 flex items-center justify-between">
              <h3 className="font-semibold text-sm">Notifications</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs text-primary hover:bg-transparent hover:text-primary/80"
                onClick={() => toast.success("All notifications caught up!")}
              >
                Clear all
              </Button>
            </div>
            <ScrollArea className="h-80">
              <div className="divide-y">
                {activities.map((act) => (
                  <div key={act.id} className="p-3 hover:bg-muted/30 transition-colors flex gap-2.5 items-start">
                    <div className="mt-0.5 p-1 rounded-md bg-muted flex items-center justify-center shrink-0">
                      {getActivityIcon(act.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-foreground font-medium leading-normal">{act.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
                        <span>by {act.actor}</span>
                        <span>·</span>
                        <span>{act.at}</span>
                      </p>
                    </div>
                  </div>
                ))}
                {activities.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-10">No notifications available.</p>
                )}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>

        {/* User Account Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer">
              <Avatar className="h-8 w-8 ring-1 ring-border">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {getInitials(profile.name)}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none">{profile.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{profile.role}</p>
                <p className="text-[10px] leading-none text-muted-foreground mt-1">{profile.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate({ to: "/settings" })} className="cursor-pointer">
              Settings & Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                resetStore();
                toast.success("Workspace reset to default mock data successfully!");
              }}
              className="cursor-pointer text-warning hover:text-warning"
            >
              Reset to Defaults
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                const { error } = await supabase.auth.signOut();
                if (error) {
                  toast.error(error.message);
                } else {
                  toast.success("Logged out successfully!");
                  navigate({ to: "/" });
                }
              }}
              className="cursor-pointer text-destructive"
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
