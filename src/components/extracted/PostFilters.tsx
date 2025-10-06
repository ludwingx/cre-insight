"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function PostFilters() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Red social" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="facebook">Facebook</SelectItem>
          <SelectItem value="instagram">Instagram</SelectItem>
          <SelectItem value="tiktok">TikTok</SelectItem>
        </SelectContent>
      </Select>

      <Input
        placeholder="Buscar por palabra clave..."
        className="flex-1 min-w-[200px]"
      />

      <Input type="date" className="w-[180px]" />
    </div>
  )
}
