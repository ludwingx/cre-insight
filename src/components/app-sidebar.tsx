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
        { title: "Negativas", url: "/dashboard/reputation/negatives" },
        { title: "Tendencias", url: "/dashboard/reputation/trends" },
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
<SidebarHeader className="p-2">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10 text-primary">
            <BarChart3 className="w-6 h-6" />
          </div>
         
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
