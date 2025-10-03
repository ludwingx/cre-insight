"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";

interface CandidateFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

export function CandidateFormModal({ open, onOpenChange, onSubmit, initialData }: CandidateFormModalProps) {
  const [form, setForm] = useState({
    departamento: "",
    titularidad: "",
    nombre_completo: "",
    facebook_url: "",
    instagram_url: "",
    tiktok_url: "",
    status: "ACTIVO",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else if (open) {
      setForm({
        departamento: "",
        titularidad: "",
        nombre_completo: "",
        facebook_url: "",
        instagram_url: "",
        tiktok_url: "",
        status: "ACTIVO",
      });
    }
  }, [initialData, open]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(form);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? "Editar candidato" : "Nuevo candidato"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="departamento">Departamento</Label>
            <Select value={form.departamento} onValueChange={value => handleChange({ target: { name: 'departamento', value } } as any)}>
              <SelectTrigger id="departamento">
                <SelectValue placeholder="Seleccionar departamento" />
              </SelectTrigger>
              <SelectContent>
              <SelectItem value="PAIS">PAIS</SelectItem>
                <SelectItem value="LA PAZ">LA PAZ</SelectItem>
                <SelectItem value="SANTA CRUZ">SANTA CRUZ</SelectItem>
                <SelectItem value="COCHABAMBA">COCHABAMBA</SelectItem>
                <SelectItem value="ORURO">ORURO</SelectItem>
                <SelectItem value="POTOSI">POTOSI</SelectItem>
                <SelectItem value="CHUQUISACA">CHUQUISACA</SelectItem>
                <SelectItem value="TARIJA">TARIJA</SelectItem>
                <SelectItem value="BENI">BENI</SelectItem>
                <SelectItem value="PANDO">PANDO</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="titularidad">Titularidad</Label>
            <Select value={form.titularidad} onValueChange={value => handleChange({ target: { name: 'titularidad', value } } as any)}>
              <SelectTrigger id="titularidad">
                <SelectValue placeholder="Seleccionar titularidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PRESIDENTE">PRESIDENTE</SelectItem>
                <SelectItem value="VICEPRESIDENTE">VICEPRESIDENTE</SelectItem>
                <SelectItem value="SENADOR">SENADOR</SelectItem>
                <SelectItem value="DIPUTADO PLURINOMINAL">DIPUTADO PLURINOMINAL</SelectItem>
                <SelectItem value="DIPUTADO UNINOMINAL URBANO">DIPUTADO UNINOMINAL URBANO</SelectItem>
                <SelectItem value="DIPUTADO UNINOMINAL RURAL">DIPUTADO UNINOMINAL RURAL</SelectItem>
                <SelectItem value="DIPUTADO SUPRAESTATAL">DIPUTADO SUPRAESTATAL</SelectItem>
                <SelectItem value="DIPUTADO CIRCUNSCRIPCIÓN ESPECIAL">DIPUTADO CIRCUNSCRIPCIÓN ESPECIAL</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="nombre_completo">Nombre completo</Label>
            <Input id="nombre_completo" placeholder="Nombre completo" name="nombre_completo" value={form.nombre_completo} onChange={handleChange} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="facebook_url">Facebook URL</Label>
            <Input id="facebook_url" placeholder="Facebook URL" name="facebook_url" value={form.facebook_url} onChange={handleChange} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="instagram_url">Instagram URL</Label>
            <Input id="instagram_url" placeholder="Instagram URL" name="instagram_url" value={form.instagram_url} onChange={handleChange} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="tiktok_url">TikTok URL</Label>
            <Input id="tiktok_url" placeholder="TikTok URL" name="tiktok_url" value={form.tiktok_url} onChange={handleChange} />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading
                ? (initialData
                  ? "Guardando..."
                  : "Creando...")
                : (initialData
                  ? "Guardar cambios"
                  : "Crear candidato")}
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancelar</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
