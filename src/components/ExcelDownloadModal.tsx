"use client";
import React, { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import type { Post } from "@/types/Post";
import { FileSpreadsheet } from "lucide-react";

interface SinActividadItem {
  candidato: string;
  titularidad: string;
  departamento: string;
  redsocial: string;
}

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

interface ExcelDownloadModalProps {
  posts: Post[];
  sinActividad?: SinActividadItem[];
  departamentoNombre: string;
  className?: string;
}

export const ExcelDownloadModal: React.FC<ExcelDownloadModalProps> = ({ posts, sinActividad = [], departamentoNombre, className = "" }: ExcelDownloadModalProps) => {
  // Fecha por defecto: ayer (zona local del navegador)
  const defaultDate = () => {
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(hoy.getDate() - 1);
    return ayer.toISOString().slice(0, 10);
  };
  const [startDate, setStartDate] = useState<string>(() => defaultDate());
  const [endDate, setEndDate] = useState<string>(() => defaultDate());
  const [selectedTitularidad, setSelectedTitularidad] = useState("");
  const [selectedDepartamento, setSelectedDepartamento] = useState("");
  const [descargando, setDescargando] = useState(false);

  // Obtener departamentos únicos de los posts
  const departamentos = [
  "LA PAZ",
  "SANTA CRUZ",
  "COCHABAMBA",
  "ORURO",
  "POTOSI",
  "CHUQUISACA",
  "TARIJA",
  "BENI",
  "PANDO"
];

  // Helpers de fecha: normalizar a día YYYY-MM-DD en America/La_Paz (-04:00)
  const ymdInLaPaz = (date: Date) => {
    const laPaz = new Date(date.getTime() - 4 * 60 * 60 * 1000);
    const y = laPaz.getUTCFullYear();
    const m = String(laPaz.getUTCMonth() + 1).padStart(2, "0");
    const d = String(laPaz.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // Filtrar posts según los filtros (comparando por día en La Paz)
  const filteredPosts = posts.filter(post => {
    if (selectedTitularidad && post.titularidad !== selectedTitularidad) return false;
    if (selectedDepartamento && post.departamento !== selectedDepartamento) return false;
    const ymd = post.fechapublicacion ? ymdInLaPaz(new Date(post.fechapublicacion as any)) : "";
    if (startDate && (!ymd || ymd < startDate)) return false;
    if (endDate && (!ymd || ymd > endDate)) return false;
    return true;
  });

  const resetFilters = () => {
    const d = defaultDate();
    setStartDate(d);
    setEndDate(d);
    setSelectedTitularidad("");
    setSelectedDepartamento("");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className={`bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto ${className}`}>Descargar Excel <FileSpreadsheet /></Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl w-full">
        <DialogHeader>
          <DialogTitle>Descargar Excel</DialogTitle>
          <DialogDescription>
            Exporta un archivo .xlsx con publicaciones filtradas por titularidad, departamento y rango de fechas.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Titularidad</label>
                <select
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedTitularidad}
                  onChange={e => setSelectedTitularidad(e.target.value)}
                >
                  <option value="">Todas</option>
                  {titularidades.map((tit: string) => (
                    <option key={tit} value={tit}>{tit}</option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">Filtra por cargo del candidato.</p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Departamento</label>
                <select
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedDepartamento}
                  onChange={e => setSelectedDepartamento(e.target.value)}
                >
                  <option value="">Todos</option>
                  {departamentos.map(dep => (
                    <option key={dep} value={dep}>{dep}</option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">Selecciona un departamento o deja "Todos".</p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Desde</label>
                <input
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="date"
                  value={startDate}
                  max={endDate}
                  onChange={e => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Hasta</label>
                <input
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={e => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Las fechas se interpretan como días completos en zona America/La_Paz (UTC-4).</p>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Coincidencias actuales: <span className="font-medium">{filteredPosts.length}</span> publicaciones</div>
            <Button variant="ghost" onClick={resetFilters} disabled={descargando}>Limpiar filtros</Button>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="default"
            className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
            onClick={async () => {
              setDescargando(true);
              const params = new URLSearchParams();
              if (startDate) params.append("desde", startDate);
              if (endDate) params.append("hasta", endDate);
              if (selectedDepartamento) params.append("ciudad", selectedDepartamento);
              if (selectedTitularidad) params.append("titularidad", selectedTitularidad);
              const url = `/api/export-excel?${params.toString()}`;
              const res = await fetch(url);
              if (res.ok) {
                const blob = await res.blob();
                const link = document.createElement("a");
                link.href = window.URL.createObjectURL(blob);
                const hoy = new Date();
                let fechaParaNombre = startDate ? startDate : hoy.toISOString().slice(0, 10);
                let fechaFinNombre = endDate && endDate !== startDate ? `_${endDate}` : "";
                const parts = [fechaParaNombre + fechaFinNombre];
                if (selectedDepartamento) parts.push(selectedDepartamento.replace(/\s+/g, "_"));
                if (selectedTitularidad) parts.push(selectedTitularidad.replace(/\s+/g, "_"));
                const nombreArchivo = "reporte-" + parts.join("-") + ".xlsx";
                link.download = nombreArchivo;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              } else {
                alert("Error al descargar el archivo");
              }
              setDescargando(false);
            }}
            disabled={descargando}
          >
            {descargando ? "Descargando..." : "Descargar Excel"}
          </Button>
          <DialogClose asChild>
            <Button variant="outline" className="p-2">Cerrar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
