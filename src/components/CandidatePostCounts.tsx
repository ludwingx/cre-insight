"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface CandidateCountItem {
  id: number;
  nombre_completo: string;
  titularidad: string;
  departamento: string;
  total_posts: number;
  total_likes: number;
}

// Format YYYY-MM-DD in La Paz time (UTC-4, no DST)
function ymdInLaPaz(dateUTC: Date): string {
  const laPaz = new Date(dateUTC.getTime() - 4 * 60 * 60 * 1000);
  const y = laPaz.getUTCFullYear();
  const m = String(laPaz.getUTCMonth() + 1).padStart(2, "0");
  const d = String(laPaz.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDaysUTC(d: Date, days: number) {
  const nd = new Date(d);
  nd.setUTCDate(nd.getUTCDate() + days);
  return nd;
}

function getDefaultDate() {
  // Yesterday in La Paz, formatted as YYYY-MM-DD
  const nowUTC = new Date();
  const ayerUTC = addDaysUTC(nowUTC, -1);
  return ymdInLaPaz(ayerUTC);
}

export function CandidatePostCounts() {
  const defaultYesterday = React.useMemo(() => getDefaultDate(), []);
  const [desde, setDesde] = React.useState<string>(() => defaultYesterday);
  const [hasta, setHasta] = React.useState<string>(() => defaultYesterday);
  const [titularidad, setTitularidad] = React.useState<string>("");
  const [departamento, setDepartamento] = React.useState<string>("");
  const [data, setData] = React.useState<CandidateCountItem[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>("");
  const [page, setPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(10);

  const titularidades = [
    "PRESIDENTE",
    "VICEPRESIDENTE",
    "SENADOR",
    "DIPUTADO PLURINOMINAL",
    "DIPUTADO UNINOMINAL URBANO",
    "DIPUTADO UNINOMINAL RURAL",
    "DIPUTADO SUPRAESTATAL",
    "DIPUTADO CIRCUNSCRIPCIÓN ESPECIAL",
  ];
  const departamentos = [
    "SANTA CRUZ",
    "BENI",
    "PANDO",
    "COCHABAMBA",
    "CHUQUISACA",
    "TARIJA",
    "LA PAZ",
    "ORURO",
    "POTOSI",
  ];

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (desde) params.append("desde", desde);
      if (hasta) params.append("hasta", hasta);
      if (titularidad) params.append("titularidad", titularidad);
      if (departamento) params.append("departamento", departamento);
      const res = await fetch(`/api/candidate-post-counts?${params.toString()}`);
      if (!res.ok) throw new Error("Error al obtener datos");
      const json = await res.json();
      setData(json.data || []);
    } catch (e: any) {
      setError(e?.message || "Error desconocido");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [desde, hasta, titularidad, departamento]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleReset = React.useCallback(() => {
    const d = getDefaultDate();
    setDesde(d);
    setHasta(d);
    setTitularidad("");
    setDepartamento("");
    // fetchData será invocado por el useEffect cuando cambien los estados
    setPage(1);
  }, []);

  // Reiniciar a página 1 cuando cambie el dataset por filtros/fechas
  React.useEffect(() => {
    setPage(1);
  }, [desde, hasta, titularidad, departamento]);

  // Cambiar tamaño de página reinicia a la primera
  React.useEffect(() => {
    setPage(1);
  }, [pageSize]);

  return (
    <Card className="w-full mt-6 border-blue-100 mb-6">
      <CardHeader>
        <CardTitle className="text-blue-700">Actividad por candidato</CardTitle>
        <CardDescription>
          Visualiza la cantidad total de me gustas y publicaciones para cada candidato en el rango seleccionado.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center gap-4 mb-4 w-full">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Titularidad</label>
            <select
              className="border rounded px-2 py-1 min-w-[220px]"
              value={titularidad}
              onChange={(e) => setTitularidad(e.target.value)}
            >
              <option value="">Todas</option>
              {titularidades.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Departamento</label>
            <select
              className="border rounded px-2 py-1 min-w-[200px]"
              value={departamento}
              onChange={(e) => setDepartamento(e.target.value)}
            >
              <option value="">Todos</option>
              {departamentos.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Desde</label>
            <input
              type="date"
              className="border rounded px-2 py-1"
              value={desde}
              max={hasta || defaultYesterday}
              onChange={(e) => setDesde(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Hasta</label>
            <input
              type="date"
              className="border rounded px-2 py-1"
              value={hasta}
              min={desde}
              max={defaultYesterday}
              onChange={(e) => setHasta(e.target.value)}
            />
          </div>
          <button
            onClick={handleReset}
            className="ml-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
            disabled={loading}
          >
            {loading ? "Cargando..." : "Limpiar filtro"}
          </button>
        </div>

        {error ? (
          <div className="text-red-600 text-sm mb-2">{error}</div>
        ) : null}

        <div className="overflow-x-auto">
          <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[64px] text-center font-bold ">N°</TableHead>
                <TableHead className="min-w-[260px] font-bold">Candidato</TableHead>
                <TableHead className="min-w-[160px] font-bold">Titularidad</TableHead>
                <TableHead className="min-w-[140px] font-bold">Departamento</TableHead>
                <TableHead className="text-right min-w-[120px] font-bold">Likes</TableHead>
                <TableHead className="text-right min-w-[120px] font-bold">Total posts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">Cargando...</TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">Sin resultados</TableCell>
                </TableRow>
              ) : (
                (() => {
                  const total = data.length;
                  const totalPages = Math.max(1, Math.ceil(total / pageSize));
                  const safePage = Math.min(page, totalPages);
                  const start = (safePage - 1) * pageSize;
                  const end = start + pageSize;
                  const pageRows = data.slice(start, end);
                  return pageRows.map((row, idx) => (
                    <TableRow key={row.id}>
                      <TableCell className="text-center">{start + idx + 1}</TableCell>
                      <TableCell className="font-medium">{row.nombre_completo}</TableCell>
                      <TableCell>{row.titularidad}</TableCell>
                      <TableCell>{row.departamento}</TableCell>
                      <TableCell className="text-right">{row.total_likes}</TableCell>
                      <TableCell className="text-right font-semibold">{row.total_posts}</TableCell>
                    </TableRow>
                  ));
                })()
              )}
            </TableBody>
          </Table>
          </div>
        </div>

        {/* Controles de paginación */}
        {data.length > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Filas por página</label>
              <select
                className="border rounded px-2 py-1"
                value={pageSize}
                onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <div className="text-sm text-muted-foreground">
              Mostrando {Math.min((page - 1) * pageSize + 1, data.length)}–
              {Math.min(page * pageSize, data.length)} de {data.length}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                aria-label="Anterior"
              >
                ←
              </Button>
              <span className="text-sm">
                Página {page} de {Math.max(1, Math.ceil(data.length / pageSize))}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => {
                  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
                  return Math.min(totalPages, p + 1);
                })}
                disabled={page >= Math.ceil(data.length / pageSize) || loading}
                aria-label="Siguiente"
              >
                →
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
