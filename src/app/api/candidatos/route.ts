import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const candidatos = await prisma.candidatos.findMany({ orderBy: { id: "asc" } });
    return NextResponse.json({ candidatos });
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener candidatos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const nuevo = await prisma.candidatos.create({
      data: {
        ...data,
        fecha_actualizacion: new Date(),
        status: data.status || "ACTIVO",
      },
    });
    return NextResponse.json({ candidato: nuevo, message: "Candidato creado" });
  } catch (error) {
    return NextResponse.json({ error: "Error al crear candidato" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const actualizado = await prisma.candidatos.update({
      where: { id: data.id },
      data: {
        ...data,
        fecha_actualizacion: new Date(),
      },
    });
    return NextResponse.json({ candidato: actualizado, message: "Candidato actualizado" });
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar candidato" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    const inactivado = await prisma.candidatos.update({
      where: { id },
      data: { status: "INACTIVO", fecha_actualizacion: new Date() },
    });
    return NextResponse.json({ candidato: inactivado, message: "Candidato inactivado" });
  } catch (error) {
    return NextResponse.json({ error: "Error al eliminar candidato" }, { status: 500 });
  }
}
