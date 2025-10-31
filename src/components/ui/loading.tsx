"use client";

export function Loader() {
  return (
    <div className="flex items-center justify-center h-[70vh] text-muted-foreground">
      Cargando información del post...
    </div>
  );
}

export function NotFound() {
  return (
    <div className="flex items-center justify-center h-[70vh] text-muted-foreground">
      No se encontró el post solicitado.
    </div>
  );
}
