import * as React from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronsUpDown } from "lucide-react";

export type ColorOption = {
  name: string;
  value: string; // HEX or CSS color
};

const DEFAULT_COLORS: ColorOption[] = [
  { name: "Negro", value: "#222" },
  { name: "Blanco", value: "#fff" },
  { name: "Rojo", value: "#e53935" },
  { name: "Rojo Oscuro", value: "#b71c1c" },
  { name: "Azul", value: "#1e88e5" },
  { name: "Azul Marino", value: "#0d47a1" },
  { name: "Azul Claro", value: "#90caf9" },
  { name: "Verde", value: "#43a047" },
  { name: "Verde Lima", value: "#cddc39" },
  { name: "Verde Pastel", value: "#a5d6a7" },
  { name: "Amarillo", value: "#fbc02d" },
  { name: "Amarillo Pastel", value: "#fff59d" },
  { name: "Naranja", value: "#ff9800" },
  { name: "Naranja Pastel", value: "#ffe0b2" },
  { name: "Rosa", value: "#d81b60" },
  { name: "Rosa Pastel", value: "#f8bbd0" },
  { name: "Morado", value: "#8e24aa" },
  { name: "Violeta", value: "#7c4dff" },
  { name: "Gris", value: "#757575" },
  { name: "Gris Claro", value: "#e0e0e0" },
  { name: "Marrón", value: "#795548" },
  { name: "Dorado", value: "#ffd700" },
  { name: "Plateado", value: "#c0c0c0" },
  { name: "Azul Turquesa", value: "#00bcd4" },
  { name: "Transparente", value: "transparent" },
];

export function ColorSelector({
  name,
  value,
  onChange,
  colors = DEFAULT_COLORS,
  required = false,
}: {
  name: string;
  value?: string;
  onChange?: (color: string) => void;
  colors?: ColorOption[];
  required?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const selected = colors.find((c) => c.value === value) || null;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center w-full justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm hover:bg-accent cursor-pointer",
            !selected && "text-muted-foreground"
          )}
          aria-label={selected ? selected.name : "Selecciona color"}
        >
          <span className="flex items-center gap-2">
            <span
              className="inline-block w-5 h-5 rounded-full border border-[0.5px] border-muted"
              style={selected?.name === "Transparente"
                ? { background: 'repeating-conic-gradient(#eee 0% 25%, #fff 0% 50%) 50% / 12px 12px', backgroundColor: 'transparent' }
                : { background: selected?.value || "#f5f5f5" }}
            />
            {selected ? selected.name : "Selecciona color..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3">
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <Tooltip key={color.value}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "w-8 h-8 rounded-full border border-[2px] flex items-center justify-center transition-all focus:ring-2 focus:ring-primary/80",
                    color.name === "Blanco" && value !== color.value ? "border-gray-400" :
                    color.name === "Transparente" && value !== color.value ? "border-gray-800" : "border-muted",
                    value === color.value && "border-primary ring-2 ring-primary"
                  )}
                 
                  style={color.name === "Transparente"
                    ? { background: 'repeating-conic-gradient(#eee 0% 25%, #fff 0% 50%) 50% / 12px 12px', backgroundColor: 'transparent' }
                    : { background: color.value }}
                  aria-label={color.name}
                  onClick={() => {
                    onChange?.(color.value);
                    setOpen(false);
                  }}
                >

                </button>
              </TooltipTrigger>
              <TooltipContent>{color.name}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </PopoverContent>
      <input type="hidden" name={name} value={value || ""} required={required} readOnly />
    </Popover>
  );
}
