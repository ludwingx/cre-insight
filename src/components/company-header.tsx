"use client"

import * as React from "react"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function CompanyHeader({
  company,
}: {
  company: {
    name: string
    logo: string | React.ElementType
    plan: string
  }
}) {
  if (!company) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" className="cursor-default">
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            {typeof company.logo === "string" ? (
              <img src={company.logo} alt={company.name + " logo"} className="size-6" />
            ) : (
              <company.logo className="size-4" />
            )}
          </div>
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{company.name}</span>
            <span className="truncate text-xs">{company.plan}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
