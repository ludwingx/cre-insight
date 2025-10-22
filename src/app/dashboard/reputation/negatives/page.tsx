"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import {
  MentionsTable,
  type Mention,
} from "@/components/reputation/MentionsTable";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-separator";

export default function NegativesPage() {
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchMentions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/mentions");

      if (!response.ok) {
        throw new Error("Error al cargar las menciones");
      }

      const data = await response.json();
      setMentions(data);
    } catch (err) {
      console.error("Error fetching mentions:", err);
      setError("Error al cargar las menciones. Por favor, intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentions();
  }, []);

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
      <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-[2000px] mx-auto w-full">
        {/* Header Section */}
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between bg-background p-4 sm:p-6 rounded-lg">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Menciones Negativas
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Monitorea las menciones negativas de C.R.E. SL
            </p>
          </div>
          <div className="flex-shrink-0 w-full sm:w-auto mt-3 sm:mt-0">
            <Button
              variant="default"
              size="sm"
              onClick={fetchMentions}
              disabled={loading}
              className="w-full sm:w-auto cursor-pointer hover:bg-primary/80 "
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              {loading ? "Cargando..." : "Actualizar"}
            </Button>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-card rounded-lg border overflow-hidden">
          {/* Table Content */}
          <div className="overflow-x-auto">
            {error ? (
              <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center">
                <p className="text-red-500 mb-4 text-sm sm:text-base">
                  {error}
                </p>
                <Button
                  variant="default"
                  size="sm"
                  onClick={fetchMentions}
                  disabled={loading}
                  className="mt-2 hover:bg-primary/80 "
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
                  />
                  Reintentar
                </Button>
              </div>
            ) : loading && mentions.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 sm:p-12">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mb-3" />
                <p className="text-sm sm:text-base text-muted-foreground">
                  Cargando menciones...
                </p>
              </div>
            ) : (
              <div className="min-w-[800px] sm:min-w-0">
                <MentionsTable initialMentions={filteredMentions} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
