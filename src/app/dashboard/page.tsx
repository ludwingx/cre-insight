import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import prisma from "@/lib/prisma";

import { ExcelDownloadModal } from "@/components/ExcelDownloadModal";
import { CandidatePostCounts } from "@/components/CandidatePostCounts";
import { CandidateActivityOverview } from "@/components/CandidateActivityOverview";
import { SocialMediaPieChart } from "@/components/dashboard/SocialMediaPieChart";
import { QuickActionCard } from "@/components/ui/quick-action-card";
import {
  BarChart3,
  Download,
  FileText,
  PieChart,
  Users,
  MapPin,
  Activity,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { ParticipationPieChart } from "@/components/dashboard/ParticipationPieChart";
import { DepartmentsBarChart } from "@/components/dashboard/DepartmentsBarChart";
import { Label } from "@/components/ui/label";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export default async function Page() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-muted/20">
      <div className="flex flex-col items-center gap-6 w-full max-w-2xl px-6 text-center animate-in fade-in zoom-in duration-500">
        {/* Logo */}
        <div className="relative w-40 h-40 md:w-48 md:h-48 mb-4 drop-shadow-xl">
          <img
            className="w-full h-full object-contain"
            src="https://www.somare.com/wp-content/uploads/2020/02/logo-cre.jpg"
            alt="Logo C.R.E."
          />
        </div>

        {/* Títulos */}
        <div className="space-y-4">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-primary">
            C.R.E. <span className="text-foreground">Insights</span>
          </h1>
          <p className="text-base md:text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Bienvenido al panel de control. Selecciona una opción del menú lateral para monitorear métricas, gestionar la reputación y analizar tendencias.
          </p>
        </div>
      </div>
    </div>
  );
}
