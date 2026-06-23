import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Target,
  CheckCircle2,
  ListTodo,
  AlertTriangle,
  Lightbulb,
  HeartPulse,
  BarChart3,
  Settings,
  Sparkles,
  GitBranch,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const mainNav = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Organization Goals", url: "/organization-goals", icon: Target },
  { title: "SMART Goals", url: "/smart-goals", icon: CheckCircle2 },
  { title: "Action Plans", url: "/action-plans", icon: ListTodo },
  { title: "Traceability", url: "/traceability", icon: GitBranch },
  { title: "Challenges", url: "/challenges", icon: AlertTriangle },
  { title: "Solutions", url: "/solutions", icon: Lightbulb },
];

const insightNav = [
  { title: "Emotional Tracking", url: "/emotional-tracking", icon: HeartPulse },
  { title: "Reports", url: "/reports", icon: BarChart3 },
];

const systemNav = [
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (url: string) =>
    url === "/" ? pathname === "/" : pathname === url || pathname.startsWith(url + "/");

  const renderGroup = (label: string, items: typeof mainNav) => (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                <Link to={item.url} className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold tracking-tight">PB39</span>
            <span className="text-[11px] text-muted-foreground">Personal Board</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {renderGroup("Workspace", mainNav)}
        {renderGroup("Insights", insightNav)}
        {renderGroup("System", systemNav)}
      </SidebarContent>
    </Sidebar>
  );
}
