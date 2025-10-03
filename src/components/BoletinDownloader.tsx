"use client";
import { Button } from "@/components/ui/button";
import { generarBoletinPDF } from "@/utils/pdfBoletin";
import React from "react";

import type { Post } from "@/types/Post";

interface SinActividadItem {
  candidato: string;
  titularidad: string;
  departamento: string;
  redsocial: string;
}

export function BoletinDownloader({ posts, sinActividad = [], departamentoNombre, desde, hasta }: { posts: Post[]; sinActividad?: SinActividadItem[]; departamentoNombre: string; desde?: string; hasta?: string }) {
  const handleDownload = React.useCallback(() => {
    const destacados = ["Jorge Tuto Quiroga", "Juan Pablo Velazco"];
    const titularidades = [
      "PRESIDENTE",
      "VICEPRESIDENTE",
      "SENADOR",
      "DIPUTADO PLURINOMINAL",
      "DIPUTADO UNINOMINAL URBANO",
      "DIPUTADO UNINOMINAL RURAL",
      "DIPUTADO SUPRAESTATAL",
      "DIPUTADO CIRCUNSCRIPCIÓN ESPECIAL",
      "SIN ACTIVIDAD EN RRSS",
    ];
    const fechaHoy = new Date();
    const fechaHoyStr = fechaHoy.toLocaleDateString("es-BO", { day: "2-digit", month: "2-digit", year: "numeric" });
    generarBoletinPDF({
      posts,
      titularesDestacados: destacados,
      titularidades,
      sinActividad,
      fechaHoy: fechaHoyStr,
      departamentoNombre,
      desde,
      hasta
    });
  }, [posts, sinActividad, departamentoNombre]);

  return (
    <Button
      variant="default"
      className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
      onClick={handleDownload}
    >
      Descargar Boletín
    </Button>
  );
}
