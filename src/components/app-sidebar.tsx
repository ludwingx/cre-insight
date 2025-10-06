"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Database,
  AlertTriangle,
  BarChart3,
  Settings2,
  Bot,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Equipo C.R.E.",
    email: "admin@cre-insights.com",
    avatar: "/avatars/cre-logo.png",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      items: [
        { title: "Resumen general", url: "/dashboard/overview" },
        { title: "Métricas", url: "/dashboard/metrics" },
      ],
    },
    {
      title: "Publicaciones",
      url: "/posts",
      icon: Database,
      items: [
        { title: "Extraídas", url: "/dashboard/posts/extracted" },
        { title: "Monitoreo", url: "/dashboard/posts/monitor" },
      ],
    },
    {
      title: "Reputación",
      url: "/reputation",
      icon: AlertTriangle,
      items: [
        { title: "Negativas", url: "/reputation/negatives" },
        { title: "Tendencias", url: "/reputation/trends" },
      ],
    },
    {
      title: "Automatización",
      url: "/automation",
      icon: Bot,
      items: [
        { title: "Scraping", url: "/automation/scraping" },
        { title: "Historial", url: "/automation/history" },
      ],
    },
    {
      title: "Configuraciones",
      url: "/settings",
      icon: Settings2,
      items: [
        { title: "Preferencias", url: "/settings/preferences" },
        { title: "Usuarios", url: "/settings/users" },
      ],
    },
  ],
}

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user?: { name: string; email: string; avatar: string }
}) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2">
          <BarChart3 className="w-6 h-6 text-primary" />
          <span className="font-semibold text-base tracking-wide">
            C.R.E. Insights
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user || data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
