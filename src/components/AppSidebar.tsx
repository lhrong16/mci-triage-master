import { Link, useRouterState } from "@tanstack/react-router";
import { Activity, BookOpen, FileWarning, Home, ShieldAlert, Stethoscope, Database } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Triage Assessment", url: "/triage", icon: Stethoscope },
  { title: "Rule Knowledge Base", url: "/rules", icon: BookOpen },
  { title: "METHANE Report", url: "/methane", icon: FileWarning },
  { title: "Incident Records", url: "/admin", icon: Database },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: r => r.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="px-3 pt-4 pb-2 flex items-center gap-2">
          <div className="relative h-9 w-9 rounded-md grid place-items-center bg-[var(--gradient-emergency)] shadow-[var(--shadow-glow-red)]">
            <ShieldAlert className="h-5 w-5 text-primary-foreground" />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-triage-red animate-pulse-glow" />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-sm font-bold tracking-wide">TriageMaster</div>
              <div className="text-[10px] uppercase text-muted-foreground tracking-widest">Triage Expert System</div>
            </div>
          )}
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>Modules</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(it => {
                const active = path === it.url;
                return (
                  <SidebarMenuItem key={it.url}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link to={it.url} className="flex items-center gap-2">
                        <it.icon className="h-4 w-4" />
                        {!collapsed && <span>{it.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Status</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-3 py-2 text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-2"><Activity className="h-3 w-3 text-triage-green"/> {!collapsed && "System online"}</div>
              <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-triage-red animate-pulse"/> {!collapsed && "Live engine"}</div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
