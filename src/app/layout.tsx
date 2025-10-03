import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";


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
      </body>
    </html>
  );
}
