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
  ChevronRight,
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { useLanguage } from "@/hooks/use-language";
import * as React from "react";

interface SidebarItem {
  title: string;
  url: string;
  icon: React.ComponentType<any>;
  items?: Array<{ title: string; url: string }>;
}

const mainNav: SidebarItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Annual Goals", url: "/organization-goals", icon: Target },
  { title: "Smart Goals", url: "/smart-goals", icon: CheckCircle2 },
  { 
    title: "Action Plans", 
    url: "/action-plans", 
    icon: ListTodo,
    items: [
      { title: "Challenges", url: "/challenges" },
      { title: "Solutions", url: "/solutions" },
    ]
  },
];

const insightNav: SidebarItem[] = [
  { title: "Emotional Tracking", url: "/emotional-tracking", icon: HeartPulse },
  { title: "Reports", url: "/reports", icon: BarChart3 },
];

const systemNav: SidebarItem[] = [
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { t } = useLanguage();
  
  const isActive = (url: string) =>
    url === "/" ? pathname === "/" : pathname === url || pathname.startsWith(url + "/");

  const renderGroup = (label: string, items: SidebarItem[]) => (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const hasSubitems = item.items && item.items.length > 0;
            const isSubitemActive = hasSubitems && item.items?.some(sub => pathname.startsWith(sub.url));
            const shouldBeOpen = pathname.startsWith(item.url) || isSubitemActive;

            if (hasSubitems) {
              return (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={shouldBeOpen}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <div className="flex items-center justify-between w-full">
                      <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={t(item.title)} className="flex-1">
                        <Link to={item.url} className="flex items-center gap-3">
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span className="truncate">{t(item.title)}</span>
                        </Link>
                      </SidebarMenuButton>
                      <CollapsibleTrigger asChild>
                        <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer mr-1">
                          <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </button>
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild isActive={isActive(subItem.url)}>
                              <Link to={subItem.url}>
                                <span>{t(subItem.title)}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            }

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={t(item.title)}>
                  <Link to={item.url} className="flex items-center gap-3">
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{t(item.title)}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
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
            <span className="text-[11px] text-muted-foreground">{t("Personal Board")}</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {renderGroup(t("WORKSPACE"), mainNav)}
        {renderGroup(t("INSIGHTS"), insightNav)}
        {renderGroup(t("SYSTEM"), systemNav)}
      </SidebarContent>
    </Sidebar>
  );
}
