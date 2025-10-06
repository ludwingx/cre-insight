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
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center justify-end w-full">
            <div className="bg-white p-2 ">
              <img
                className="h-12 w-auto object-contain"
                src="https://www.somare.com/wp-content/uploads/2020/02/logo-cre.jpg"
                alt="Logo C.R.E."
              />
            </div>
          </div>
        </div>
      </header>

 


    </div>
  );
}
