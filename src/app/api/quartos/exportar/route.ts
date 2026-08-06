import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

/**
 * GET /api/quartos/exportar
 * Export rooms with occupants as formatted HTML (for print/PDF).
 * Also supports ?tipo=chamada for attendance roll by admission date.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });

    const tenantId = session.tenantId;
    if (!tenantId) return NextResponse.json({ success: false, error: "Sem tenant" }, { status: 400 });

    const { searchParams } = new URL(req.url);
    const tipo = searchParams.get("tipo") || "quartos";

    if (tipo === "chamada") {
      // Lista de chamada por ordem de chegada (tempo de casa)
      const pacientes = await prisma.paciente.findMany({
        where: { tenantId, status: "ATIVO", deletedAt: null },
        include: { quarto: { select: { numero: true } } },
        orderBy: { dataAdmissao: "asc" }, // mais antigo primeiro
      });

      const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>Lista de Chamada — Ordem de Chegada</title>
<style>
  body { font-family: -apple-system, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
  h1 { color: #0d9488; font-size: 22px; margin-bottom: 4px; }
  .meta { font-size: 11px; color: #666; margin-bottom: 24px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { background: #0d9488; color: #fff; padding: 8px 10px; text-align: left; }
  td { padding: 8px 10px; border-bottom: 1px solid #e5e7eb; }
  tr:nth-child(even) td { background: #f0fdfa; }
  .footer { margin-top: 32px; font-size: 10px; color: #999; text-align: center; border-top: 1px solid #ddd; padding-top: 12px; }
  @media print { body { padding: 15px; } }
</style></head><body>
<h1>📋 Lista de Chamada — Ordem de Chegada</h1>
<p class="meta">Gerado em ${new Date().toLocaleString("pt-BR")} · ${pacientes.length} acolhidos ativos</p>
<table>
<thead><tr><th>#</th><th>Nome</th><th>Admissão</th><th>Dias</th><th>Quarto</th></tr></thead>
<tbody>
${pacientes.map((p, i) => {
  const dias = Math.floor((Date.now() - new Date(p.dataAdmissao).getTime()) / 86400000);
  return `<tr><td>${i + 1}</td><td><strong>${p.nome}</strong></td><td>${new Date(p.dataAdmissao).toLocaleDateString("pt-BR")}</td><td>${dias} dias</td><td>${p.quarto?.numero || "—"}</td></tr>`;
}).join("")}
</tbody></table>
<div class="footer">Hachi Platform · Lista de chamada por tempo de casa (mais antigo primeiro)</div>
</body></html>`;

      return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }

    // Default: Lista de quartos com ocupantes
    const quartos = await prisma.quarto.findMany({
      where: { tenantId },
      include: { pacientes: { where: { status: "ATIVO", deletedAt: null }, select: { nome: true, dataAdmissao: true } } },
      orderBy: { numero: "asc" },
    });

    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>Mapa de Quartos</title>
<style>
  body { font-family: -apple-system, sans-serif; padding: 40px; max-width: 900px; margin: 0 auto; }
  h1 { color: #0d9488; font-size: 22px; margin-bottom: 4px; }
  .meta { font-size: 11px; color: #666; margin-bottom: 24px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { background: #0d9488; color: #fff; padding: 8px 10px; text-align: left; }
  td { padding: 8px 10px; border-bottom: 1px solid #e5e7eb; }
  tr:nth-child(even) td { background: #f0fdfa; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; }
  .badge-green { background: #d1fae5; color: #065f46; }
  .badge-red { background: #fee2e2; color: #991b1b; }
  .badge-yellow { background: #fef3c7; color: #92400e; }
  .footer { margin-top: 32px; font-size: 10px; color: #999; text-align: center; border-top: 1px solid #ddd; padding-top: 12px; }
  @media print { body { padding: 15px; } }
</style></head><body>
<h1>🏠 Mapa de Quartos / Leitos</h1>
<p class="meta">Gerado em ${new Date().toLocaleString("pt-BR")} · ${quartos.length} quartos · ${quartos.filter(q => q.pacientes.length > 0).length} ocupados</p>
<table>
<thead><tr><th>Quarto</th><th>Tipo</th><th>Andar</th><th>Capacidade</th><th>Ocupantes</th><th>Vagas</th><th>Status</th></tr></thead>
<tbody>
${quartos.map((q) => {
  const vagas = q.capacidade - q.pacientes.length;
  const statusBadge = q.pacientes.length > 0 ? '<span class="badge badge-red">Ocupado</span>' : q.status === "MANUTENCAO" ? '<span class="badge badge-yellow">Manutenção</span>' : '<span class="badge badge-green">Disponível</span>';
  const ocupantes = q.pacientes.length > 0 ? q.pacientes.map(p => p.nome.split(" ").slice(0, 2).join(" ")).join(", ") : "—";
  return `<tr><td><strong>${q.numero}</strong></td><td>${q.tipo || "—"}</td><td>${q.andar === 0 ? "Externo" : q.andar + "º"}</td><td>${q.capacidade}</td><td>${ocupantes}</td><td>${vagas}</td><td>${statusBadge}</td></tr>`;
}).join("")}
</tbody></table>
<div class="footer">Hachi Platform · Mapa de quartos gerado automaticamente</div>
</body></html>`;

    return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  } catch (error) {
    console.error("GET /api/quartos/exportar error:", error);
    return NextResponse.json({ success: false, error: "Erro" }, { status: 500 });
  }
}
