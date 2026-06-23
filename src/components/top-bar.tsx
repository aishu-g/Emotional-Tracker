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

  // Smart Goal Form
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
        toast.success(`Smart goal "${added.title}" created!`);
      } else {
        toast.error("Failed to create Smart goal in database.");
      }
      // Reset
      setSmartTitle("");
      setSmartOwner("");
    } else if (goalType === "action") {
      if (!actionTask || !actionAssignee || !actionSmartId) {
        toast.error("Please select a parent Smart goal and fill in required fields.");
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
