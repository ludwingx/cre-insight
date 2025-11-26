// ===============================
// Dashboard Layout (Arreglado)
// ===============================

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "C.R.E. Insight",
  description: "Aplicación para visualizar publicaciones de perfiles de Facebook extraídas automáticamente.",
  keywords: ["C.R.E. Insight", "scraping", "facebook", "publicaciones", "perfiles", "automático"],
  authors: [{ name: "Other Mind" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { getSession } from "@/app/actions/auth";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  if (!session) {
    const { redirect } = await import("next/navigation");
    redirect("/login");
    return null;
  }

  const user = {
    name: typeof session.username === "string" ? session.username : "Usuario",
    email: typeof session.email === "string" ? session.email : "",
    avatar:
      typeof session.avatar === "string" && session.avatar.length > 0
        ? session.avatar
        : "/avatars/default.jpg",
  };

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <SidebarProvider>
        <AppSidebar user={user} />

        <SidebarInset className="h-screen overflow-y-auto">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />

              <Separator orientation="vertical" className="mr-2 h-4" />

              <DynamicBreadcrumb />
            </div>

            <div className="ml-auto flex items-center gap-2">
              {/* Espacio para botones globales */}
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4">{children}</div>
        </SidebarInset>
      </SidebarProvider>

    </ThemeProvider>
  );
}
