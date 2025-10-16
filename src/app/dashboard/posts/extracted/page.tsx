"use client"

import { useState, useEffect } from "react"
import { Separator } from "@/components/ui/separator"
import { PostFilters } from "@/components/extracted/PostFilters"
import { PostTable } from "@/components/extracted/PostTable"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ExtractedPostsPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/posts/extracted")
      const data = await res.json()
      setPosts(data.posts)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center w-full gap-2 px-4">
          <div className="flex items-center gap-2 flex-grow min-w-0">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb className="truncate">
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Publicaciones</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Extraídas</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
      </header>
      
      <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-[2000px] mx-auto w-full">
        {/* Header Section */}
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between bg-background p-4 sm:p-6 rounded-lg">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Publicaciones Extraídas
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Monitorea las publicaciones extraídas de C.R.E. SL
            </p>
          </div>
          <div className="flex-shrink-0 w-full sm:w-auto mt-3 sm:mt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPosts}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              {loading ? "Cargando..." : "Actualizar"}
            </Button>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col gap-6">
          <div className="overflow-hidden">
            <div className="p-6">
              <Separator className="my-4" />
              {loading ? (
                <p className="text-center text-muted-foreground">Cargando publicaciones...</p>
              ) : posts.length > 0 ? (
                <PostTable posts={posts} />
              ) : (
                <p className="text-center text-muted-foreground">No hay publicaciones registradas.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}