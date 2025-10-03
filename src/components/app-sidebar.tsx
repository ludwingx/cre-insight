"use client"

import * as React from "react"
import {
  BarChart3,
  MapPin,
  TrendingUp,
  Smartphone,
  ScrollText,
  Users,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { CompanyHeader } from "@/components/company-header"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// Navigation data for TodoFundas system
const data = {
  user: {
    name: "Usuario",
    email: "usuario@librescraping.com",
    avatar: "/avatars/default.jpg",
  },
  company: {
    name: "Libre Scraping",
    logo: "/logoLibrescraping.svg",
    plan: "Sistema de visualización de datos de redes sociales",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: BarChart3,
      isActive: true,
    },
    {
      title: "Informe General",
      url: "/dashboard/igeneral",
      icon: TrendingUp,
    },
    {
      title: "Candidatos sin actividad",
      url: "/dashboard/sinpublicacion",
      icon: Users,
    },
    ...[
      "Santa Cruz",
      "La Paz",
      "Cochabamba",
      "Oruro",
      "Potosí",
      "Tarija",
      "Chuquisaca",
      "Beni",
      "Pando"
    ].map(dep => ({
      title: dep,
      url: `/dashboard/${dep.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')}`,
      icon: MapPin,
    })),
    {
      title: "Gestión de Candidatos", 
      url: "/dashboard/candidatos",
      icon: Users,
    },
  ],
}

export function AppSidebar({ user, ...props }: React.ComponentProps<typeof Sidebar> & { user?: { name: string; email: string; avatar: string } }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <CompanyHeader company={{
          ...data.company,
          // Permitir logo como string o componente
          logo: data.company.logo,
        }} />
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