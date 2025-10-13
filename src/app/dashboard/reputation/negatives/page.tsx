"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { MentionsTable, type Mention } from "@/components/reputation/MentionsTable"
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@radix-ui/react-separator"

export default function NegativesPage() {
  const [mentions, setMentions] = useState<Mention[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchMentions = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/mentions')
      
      if (!response.ok) {
        throw new Error('Error al cargar las menciones')
      }
      
      const data = await response.json()
      setMentions(data)
    } catch (err) {
      console.error('Error fetching mentions:', err)
      setError('Error al cargar las menciones. Por favor, intente nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMentions()
  }, [])

  const filteredMentions = [...mentions]; // Create a copy of the mentions array

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
                  <BreadcrumbLink href="#">Reputación</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Menciones negativas</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
      </header>

    <div className="space-y-6 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between bg-background p-4 rounded-lg border">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Menciones</h1>
          <p className="text-muted-foreground text-sm">
            Monitorea las menciones de tu marca en redes sociales
          </p>
        </div>
        <div className="flex-shrink-0">
          <Button 
            variant="outline"
            size="sm"
            onClick={fetchMentions}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Cargando...' : 'Actualizar'}
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/20 px-6 py-4 border-b">
          <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Menciones de la marca</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {mentions.length} {mentions.length === 1 ? 'mención encontrada' : 'menciones encontradas'}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button 
                variant="outline" 
                onClick={fetchMentions}
                disabled={loading}
              >
                Reintentar
              </Button>
            </div>
          ) : loading && mentions.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2">Cargando menciones...</span>
            </div>
          ) : (
            <MentionsTable initialMentions={filteredMentions} />
          )}
        </CardContent>
      </Card>
    </div>
    </div>
  )
}