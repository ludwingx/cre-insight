import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";


({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "C.R.E. Insights",
  description: "Aplicación para visualizar publicaciones de perfiles de Facebook extraídas automáticamente.",
  keywords: ["C.R.E. Insights", "scraping", "facebook", "publicaciones", "perfiles", "automático"],
  authors: [{ name: "Other Mind" }]
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
