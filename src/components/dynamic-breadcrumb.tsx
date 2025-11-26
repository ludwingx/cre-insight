"use client"

import { usePathname } from "next/navigation"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

// Mapping de rutas a nombres legibles en español
const routeNames: Record<string, string> = {
    dashboard: "Dashboard",
    overview: "Resumen",
    posts: "Publicaciones",
    extracted: "Extraídas",
    tracking: "Seguimiento",
    reputation: "Reputación",
    negatives: "Negativas",
}

export function DynamicBreadcrumb() {
    const pathname = usePathname()

    // Dividir la ruta en segmentos y filtrar vacíos
    const segments = pathname.split("/").filter(Boolean)

    // Si estamos en la raíz del dashboard, mostrar solo Dashboard
    if (segments.length === 1 && segments[0] === "dashboard") {
        return (
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbPage>Dashboard</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
        )
    }

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {segments.map((segment, index) => {
                    const href = `/${segments.slice(0, index + 1).join("/")}`
                    const isLast = index === segments.length - 1
                    const label = routeNames[segment] || segment

                    // Saltar IDs numéricos en el breadcrumb
                    if (!isNaN(Number(segment))) {
                        return null
                    }

                    return (
                        <div key={href} className="flex items-center gap-2">
                            <BreadcrumbItem className="hidden md:block">
                                {isLast ? (
                                    <BreadcrumbPage>{label}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                            {!isLast && <BreadcrumbSeparator className="hidden md:block" />}
                        </div>
                    )
                })}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
