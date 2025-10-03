import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "../globals.css";


({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Libre Scraping",
  description: "Aplicación para visualizar publicaciones de perfiles de Facebook extraídas automáticamente.",
  keywords: ["libre scraping", "scraping", "facebook", "publicaciones", "perfiles", "automático"],
  authors: [{ name: "Other Mind" }]
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

import { getSession } from "@/app/actions/auth";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  if (!session) {
    // Si no hay sesión, redirigir a login
    // (usar redirect de next/navigation)
    const { redirect } = await import("next/navigation");
    redirect("/login");
    return null;
  }
  const user = {
    name: typeof session.username === "string" ? session.username : "Usuario",
    email: typeof session.email === "string" ? session.email : "",
    avatar: "/avatars/default.jpg", // Si tienes avatar en DB, cámbialo aquí
  };
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <SidebarProvider>
        <AppSidebar user={user} />
        <SidebarInset>
          {children}
        </SidebarInset>
      </SidebarProvider>
      <Toaster position="bottom-right" richColors />
    </ThemeProvider>
  );
}
