"use client";
import React from "react";
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

interface ConfirmDeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function ConfirmDeleteModal({ open, onOpenChange, onConfirm, loading }: ConfirmDeleteModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Eliminar candidato?</DialogTitle>
        </DialogHeader>
        <p>¿Estás seguro de que deseas eliminar este candidato? Esta acción no se puede deshacer.</p>
        <DialogFooter>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? "Eliminando..." : "Eliminar"}
          </Button>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
