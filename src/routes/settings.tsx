import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useWorkspaceStore } from "@/hooks/use-workspace-store";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — PB39" },
      { name: "description", content: "Configure your workspace, profile and notification preferences." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { profile, updateProfile, orgGoalStatuses, updateOrgGoalStatuses, departments, updateDepartments } = useWorkspaceStore();

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [timezone, setTimezone] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [newDept, setNewDept] = useState("");

  // Sync state with profile
  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setRole(profile.role);
      setEmail(profile.email);
      setTimezone(profile.timezone);
    }
  }, [profile]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role) {
      toast.error("Please fill in required fields.");
      return;
    }
    updateProfile({
      name,
      role,
      email,
      timezone,
    });
    toast.success("Profile settings updated successfully!");
  };

  const handleCancel = () => {
    setName(profile.name);
    setRole(profile.role);
    setEmail(profile.email);
    setTimezone(profile.timezone);
    toast.info("Profile edits reverted.");
  };

  const handleAddStatus = (e: React.FormEvent) => {
    e.preventDefault();
    const statusVal = newStatus.trim();
    if (!statusVal) return;

    if (orgGoalStatuses.includes(statusVal)) {
      toast.error("Status value already exists.");
      return;
    }

    updateOrgGoalStatuses([...orgGoalStatuses, statusVal]);
    toast.success(`Goal status "${statusVal}" added!`);
    setNewStatus("");
  };

  const handleDeleteStatus = (statusVal: string) => {
    if (orgGoalStatuses.length <= 1) {
      toast.error("You must retain at least one active status.");
      return;
    }

    updateOrgGoalStatuses(orgGoalStatuses.filter((s) => s !== statusVal));
    toast.success(`Goal status "${statusVal}" removed.`);
  };

  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    const deptVal = newDept.trim();
    if (!deptVal) return;

    if (departments.includes(deptVal)) {
      toast.error("Department already exists.");
      return;
    }

    updateDepartments([...departments, deptVal]);
    toast.success(`Department "${deptVal}" added!`);
    setNewDept("");
  };

  const handleDeleteDept = (deptVal: string) => {
    if (departments.length <= 1) {
      toast.error("You must retain at least one active department.");
      return;
    }

    updateDepartments(departments.filter((d) => d !== deptVal));
    toast.success(`Department "${deptVal}" removed.`);
  };

  const getInitials = (n: string) => {
    return n
      .split(" ")
      .map((p) => (p ? p[0] : ""))
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-6 p-6 md:p-8">
      <PageHeader title="Settings" description="Manage your profile, workspace and notifications." />

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile" className="cursor-pointer">Profile</TabsTrigger>
          <TabsTrigger value="workspace" className="cursor-pointer">Workspace</TabsTrigger>
          <TabsTrigger value="statuses" className="cursor-pointer">Goal Statuses</TabsTrigger>
          <TabsTrigger value="departments" className="cursor-pointer">Departments</TabsTrigger>
          <TabsTrigger value="notifications" className="cursor-pointer">Notifications</TabsTrigger>
          <TabsTrigger value="billing" className="cursor-pointer">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <form onSubmit={handleSave}>
            <SectionCard title="Profile" description="Update your personal information.">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">
                    {getInitials(name || profile.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    onClick={() => toast.success("Upload photo dialog triggered (simulated).")}
                    className="cursor-pointer"
                  >
                    Upload new photo
                  </Button>
                  <p className="mt-1 text-xs text-muted-foreground">PNG or JPG, up to 2MB.</p>
                </div>
              </div>
              <Separator className="my-6" />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="prof-name">Full name</Label>
                  <Input id="prof-name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prof-role">Title</Label>
                  <Input id="prof-role" value={role} onChange={(e) => setRole(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prof-email">Email</Label>
                  <Input id="prof-email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prof-tz">Timezone</Label>
                  <Input id="prof-tz" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={handleCancel} className="cursor-pointer">
                  Cancel
                </Button>
                <Button type="submit" className="cursor-pointer">Save changes</Button>
              </div>
            </SectionCard>
          </form>
        </TabsContent>

        <TabsContent value="workspace" className="mt-4">
          <SectionCard title="Workspace" description="Your organization-wide defaults.">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Workspace name</Label>
                <Input defaultValue="PB39 HQ" />
              </div>
              <div className="space-y-1.5">
                <Label>Default fiscal year start</Label>
                <Input defaultValue="January" />
              </div>
              <div className="space-y-1.5">
                <Label>Default goal cadence</Label>
                <Input defaultValue="Quarterly" />
              </div>
              <div className="space-y-1.5">
                <Label>Workspace URL</Label>
                <Input defaultValue="pb39.app/hq" />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button type="button" onClick={() => toast.success("Workspace configuration saved!")} className="cursor-pointer">
                Save Workspace Settings
              </Button>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="statuses" className="mt-4">
          <SectionCard title="Goal Status Management" description="Customize status values and stages for Organization Goals.">
            <div className="space-y-4">
              <form onSubmit={handleAddStatus} className="flex gap-2">
                <Input
                  placeholder="New status name (e.g. On Hold)"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="max-w-xs"
                  required
                />
                <Button type="submit" className="cursor-pointer">Add Status</Button>
              </form>

              <div className="rounded-xl border divide-y bg-background max-w-md">
                {orgGoalStatuses.map((st) => (
                  <div key={st} className="flex items-center justify-between p-3.5 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-primary" />
                      <span className="font-semibold text-foreground">{st}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteStatus(st)}
                      className="h-8 text-destructive hover:bg-destructive/10 cursor-pointer"
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="departments" className="mt-4">
          <SectionCard title="Departments" description="Manage departments within your organization.">
            <div className="space-y-4">
              <form onSubmit={handleAddDept} className="flex gap-2">
                <Input
                  placeholder="New department name"
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="max-w-xs"
                  required
                />
                <Button type="submit" className="cursor-pointer">Add Dept</Button>
              </form>

              <div className="rounded-xl border divide-y bg-background max-w-md">
                {departments.map((dept) => (
                  <div key={dept} className="flex items-center justify-between p-3.5 text-sm">
                    <span className="font-medium text-foreground">{dept}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDept(dept)}
                      className="h-8 text-destructive hover:bg-destructive/10 cursor-pointer"
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <SectionCard title="Notifications" description="Configure your notification preferences.">
            <div className="space-y-4">
              {[
                ["Goal progress updates", "When a goal you own changes status or progress."],
                ["New challenges", "Whenever a new challenge is raised against your goals."],
                ["Action item assignments", "When you're assigned to a new task."],
                ["Weekly digest", "A summary of activity across your workspace."],
              ].map(([t, d], i) => (
                <div key={t} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="text-sm font-medium">{t}</p>
                    <p className="text-xs text-muted-foreground">{d}</p>
                  </div>
                  <Switch
                    defaultChecked={i !== 3}
                    onCheckedChange={(checked) => {
                      toast.success(`Notification preference for "${t}" updated to ${checked ? "enabled" : "disabled"}.`);
                    }}
                  />
                </div>
              ))}
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="billing" className="mt-4">
          <SectionCard title="Billing" description="Your current plan and usage.">
            <div className="rounded-xl border bg-muted/30 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold">Enterprise plan</p>
                  <p className="mt-1 text-xs text-muted-foreground">240 seats · billed annually</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => toast.success("Billing customer portal opened (simulated).")}
                  className="cursor-pointer"
                >
                  Manage plan
                </Button>
              </div>
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
