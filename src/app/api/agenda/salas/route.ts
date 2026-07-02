import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";

/**
 * GET: List available rooms/salas for scheduling.
 * Hardcoded for now — in future, could be database-driven.
 */

const SALAS = [
  { id: "sala-1", nome: "Sala 1", tipo: "Consultório", capacidade: 2 },
  { id: "sala-2", nome: "Sala 2", tipo: "Consultório", capacidade: 2 },
  { id: "sala-3", nome: "Sala 3", tipo: "Consultório", capacidade: 2 },
  { id: "sala-grupo", nome: "Sala de Grupo", tipo: "Terapia em grupo", capacidade: 15 },
  { id: "enfermaria", nome: "Enfermaria", tipo: "Procedimentos", capacidade: 4 },
  { id: "sala-atividades", nome: "Sala de Atividades", tipo: "Terapia ocupacional", capacidade: 10 },
  { id: "refeitorio", nome: "Refeitório", tipo: "Refeições/reuniões", capacidade: 30 },
  { id: "area-externa", nome: "Área Externa", tipo: "Atividade ao ar livre", capacidade: 20 },
];

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    return NextResponse.json({ success: true, data: SALAS });
  } catch (error) {
    console.error("GET /api/agenda/salas error:", error);
    return NextResponse.json({ success: false, error: "Erro" }, { status: 500 });
  }
}
