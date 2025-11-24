"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Loader2, Check, X, Trash2, Pencil, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

type Keyword = {
  id: number;
  palabra: string;
  activa: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function KeywordsPage() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [newKeyword, setNewKeyword] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  // Fetch keywords from API
  const fetchKeywords = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/keywords");
      if (!response.ok) throw new Error("Error al cargar las palabras clave");
      const data = await response.json();
      setKeywords(data);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar las palabras clave");
    } finally {
      setLoading(false);
    }
  };

  // Load keywords on component mount
  useEffect(() => {
    fetchKeywords();
  }, []);

  // Add new keyword
  const handleAddKeyword = async () => {
    if (!newKeyword.trim()) {
      toast.error("Por favor ingresa una palabra clave");
      return;
    }

    try {
      setIsAdding(true);
      const response = await fetch("/api/keywords", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          palabra: newKeyword.trim(),
          activa: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al agregar la palabra clave");
      }

      setNewKeyword("");
      await fetchKeywords();
      toast.success("Palabra clave agregada correctamente");
    } catch (error) {
      console.error("Error:", error);
      toast.error(error instanceof Error ? error.message : "Error al agregar la palabra clave");
    } finally {
      setIsAdding(false);
    }
  };

  // Handle edit keyword
  const handleEditClick = (keyword: Keyword) => {
    setEditingId(keyword.id);
    setEditValue(keyword.palabra);
  };

  // Save edited keyword
  const handleSaveEdit = async (id: number) => {
    if (!editValue.trim()) {
      toast.error('La palabra clave no puede estar vacía');
      return;
    }

    try {
      const response = await fetch(`/api/keywords/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ palabra: editValue.trim() }),
      });

      if (!response.ok) throw new Error('Error al actualizar la palabra clave');

      await fetchKeywords();
      setEditingId(null);
      toast.success('Palabra clave actualizada correctamente');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar la palabra clave');
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  // Toggle keyword status
  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/keywords/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ activa: !currentStatus }),
      });

      if (!response.ok) throw new Error("Error al actualizar el estado");

      await fetchKeywords();
      toast.success("Estado actualizado correctamente");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al actualizar el estado");
    }
  };

  // Soft delete keyword (toggle active status)
  const handleDelete = async (id: number, currentStatus: boolean) => {
    if (currentStatus && !confirm("¿Estás seguro de desactivar esta palabra clave?")) return;
    
    try {
      const response = await fetch(`/api/keywords/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Error al actualizar el estado");

      await fetchKeywords();
      toast.success(`Palabra clave ${currentStatus ? 'desactivada' : 'activada'} correctamente`);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al actualizar el estado");
    }
  };

  // Filter keywords based on search term and active status
  const filteredKeywords = keywords.filter(keyword => {
    const matchesSearch = keyword.palabra.toLowerCase().includes(searchTerm.toLowerCase());
    return showInactive ? !keyword.activa && matchesSearch : keyword.activa && matchesSearch;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-[2000px] mx-auto w-full">
        {/* Header Section */}
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between bg-background p-4 sm:p-6 rounded-lg">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Gestión de Palabras Clave
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Administra las palabras clave para el monitoreo de menciones negativas en las publicaciones
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar palabras clave..."
                className="pl-8 w-full sm:w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Add Keyword Section */}
          <Card className="h-fit lg:col-span-4">
            <CardHeader>
              <div className="space-y-1">
                <CardTitle>Agregar Palabra Clave</CardTitle>
                <CardDescription>
                  Ingresa una nueva palabra clave para monitorear
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="Ej: servicio al cliente, atención, queja, etc."
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
                    disabled={isAdding}
                  />
                </div>
                <Button 
                  onClick={handleAddKeyword}
                  disabled={isAdding || !newKeyword.trim()}
                  className={`w-full hover:bg-primary/80 ${(isAdding || !newKeyword.trim()) ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {isAdding ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Agregando...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar Palabra
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Keywords List Section */}
          <Card className="lg:col-span-8">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <CardTitle>
                    {showInactive ? 'Palabras Clave Inactivas' : 'Palabras Clave Activas'}
                  </CardTitle>
                  <CardDescription>
                    {filteredKeywords.length} {filteredKeywords.length === 1 ? 'palabra clave' : 'palabras clave'} {showInactive ? 'inactivas' : 'activas'}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {showInactive ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs hover:cursor-pointer text-white bg-green-500 hover:bg-green-600 hover:text-white border-green-600"
                      onClick={() => setShowInactive(false)}
                    >
                      Ver activas
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs hover:cursor-pointer text-white bg-red-500 hover:bg-red-600 hover:text-white border-red-500"
                      onClick={() => setShowInactive(true)}
                    >
                      Ver inactivas
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Cargando palabras clave...</span>
                </div>
              ) : filteredKeywords.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">
                    {searchTerm ? "No se encontraron coincidencias" : "No hay palabras clave registradas"}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {searchTerm 
                      ? "Intenta con otro término de búsqueda" 
                      : "Comienza agregando tu primera palabra clave"}
                  </p>
                </div>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <div className="max-h-[400px] overflow-y-auto">
                    <Table className="min-w-full">
                      <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px] text-center">ID</TableHead>
                        <TableHead>Palabra Clave</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredKeywords.map((keyword) => (
                        <TableRow key={keyword.id}>
                          <TableCell className="font-medium text-center">{keyword.id}</TableCell>
                          <TableCell className="">
                            {editingId === keyword.id ? (
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="h-8 w-full"
                                autoFocus
                              />
                            ) : (
                              <div className="flex items-center gap-2">
                                {keyword.palabra}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 p-0 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 rounded-full cursor-pointer transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditClick(keyword);
                                  }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil">
                                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                                    <path d="m13.5 6.5 4 4"/>
                                  </svg>
                                </Button>
                              </div>
                            )}
                          </TableCell>

                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {editingId === keyword.id ? (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800 hover:border-green-300 cursor-pointer transition-colors"
                                    onClick={() => handleSaveEdit(keyword.id)}
                                  >
                                    Guardar
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 bg-red-50 text-red-600 border-red-300 hover:bg-red-100 hover:text-red-500 hover:border-red-300 cursor-pointer transition-colors"
                                    onClick={handleCancelEdit}
                                  >
                                    Cancelar
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className={`h-8 w-full sm:w-auto cursor-pointer ${keyword.activa ? 'text-red-500 hover:bg-red-50 hover:text-red-600 border-red-200 hover:border-red-300' : 'text-green-500 hover:bg-green-50 hover:text-green-600 border-green-200 hover:border-green-300'}`}
                                  onClick={() => handleToggleStatus(keyword.id, keyword.activa)}
                                >
                                  {keyword.activa ? (
                                    <X className="h-4 w-4 mr-1" />
                                  ) : (
                                    <Check className="h-4 w-4 mr-1" />
                                  )}
                                  {keyword.activa ? 'Desactivar' : 'Activar'}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}