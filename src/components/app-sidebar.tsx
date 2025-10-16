"use client";

import * as React from "react";
import { LayoutDashboard, Database, AlertTriangle, GalleryVerticalEnd, ClipboardType, BookImage } from "lucide-react";

import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { TeamSwitcher } from "./team-switcher";

const data = {
  user: {
    name: "Equipo C.R.E.",
    email: "admin@cre-insights.com",
    avatar: "/avatars/cre-logo.png",
  },
  teams: [
    {
      name: "C.R.E.",
      logo: GalleryVerticalEnd,
      plan: "Insights",
    },
  ],
  navItems: [
    {
      title: "Panel Principal",
      url: "/dashboard/overview",
      icon: LayoutDashboard,
    },
    {
      title: "Seguimiento de Publicaciones",
      url: "/dashboard/posts/extracted",
      icon: BookImage,
    },
    {
      title: "Menciones Negativas",
      url: "/dashboard/reputation/negatives",
      icon: AlertTriangle,
    },
    {
      title: "Palabras Claves",
      url: "/dashboard/keywords",
      icon: ClipboardType,
    }
  ],
};

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user?: { name: string; email: string; avatar: string };
}) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {data.navItems.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton asChild>
                <a href={item.url} className="flex items-center gap-2">
                  <item.icon className="w-4 h-4" />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user || data.user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
