import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/services/audit";
import ExcelJS from "exceljs";

// GET: Export data as Excel file
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tipo = searchParams.get("tipo");
    const formato = searchParams.get("formato") || "xlsx";

    if (!tipo || !["financeiro", "ocupacao", "pacientes"].includes(tipo)) {
      return NextResponse.json(
        { success: false, error: "Tipo inválido. Use: financeiro, ocupacao ou pacientes" },
        { status: 400 }
      );
    }

    if (formato !== "xlsx") {
      return NextResponse.json(
        { success: false, error: "Formato inválido. Apenas xlsx é suportado" },
        { status: 400 }
      );
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "HachiERP";
    workbook.created = new Date();

    let filename = "";

    switch (tipo) {
      case "pacientes": {
        filename = `pacientes_${formatDateForFile(new Date())}.xlsx`;
        const sheet = workbook.addWorksheet("Pacientes");

        sheet.columns = [
          { header: "Nome", key: "nome", width: 30 },
          { header: "CPF", key: "cpf", width: 15 },
          { header: "Status", key: "status", width: 15 },
          { header: "Data Admissão", key: "dataAdmissao", width: 15 },
          { header: "Quarto", key: "quarto", width: 10 },
        ];

        // Style header row
        styleHeaderRow(sheet);

        const pacientes = await prisma.paciente.findMany({
          where: { deletedAt: null },
          include: {
            quarto: { select: { numero: true } },
          },
          orderBy: { nome: "asc" },
        });

        for (const paciente of pacientes) {
          sheet.addRow({
            nome: paciente.nome,
            cpf: formatCPF(paciente.cpf),
            status: translateStatus(paciente.status),
            dataAdmissao: formatDate(paciente.dataAdmissao),
            quarto: paciente.quarto?.numero || "—",
          });
        }

        break;
      }

      case "financeiro": {
        filename = `financeiro_${formatDateForFile(new Date())}.xlsx`;
        const sheet = workbook.addWorksheet("Movimentações");

        sheet.columns = [
          { header: "Data", key: "data", width: 15 },
          { header: "Tipo", key: "tipo", width: 12 },
          { header: "Descrição", key: "descricao", width: 35 },
          { header: "Valor (R$)", key: "valor", width: 15 },
          { header: "Status", key: "status", width: 12 },
        ];

        styleHeaderRow(sheet);

        const movimentacoes = await prisma.movimentacaoFinanceira.findMany({
          orderBy: { dataVencimento: "desc" },
          take: 1000, // Limit to prevent memory issues
        });

        for (const mov of movimentacoes) {
          sheet.addRow({
            data: formatDate(mov.dataVencimento),
            tipo: mov.tipo === "RECEITA" ? "Receita" : "Despesa",
            descricao: mov.descricao,
            valor: mov.valor.toFixed(2),
            status: translateStatusPagamento(mov.status),
          });
        }

        // Add total row
        const totalReceitas = movimentacoes
          .filter((m) => m.tipo === "RECEITA")
          .reduce((sum, m) => sum + m.valor, 0);
        const totalDespesas = movimentacoes
          .filter((m) => m.tipo === "DESPESA")
          .reduce((sum, m) => sum + m.valor, 0);

        sheet.addRow({});
        sheet.addRow({ data: "", tipo: "", descricao: "Total Receitas", valor: totalReceitas.toFixed(2), status: "" });
        sheet.addRow({ data: "", tipo: "", descricao: "Total Despesas", valor: totalDespesas.toFixed(2), status: "" });
        sheet.addRow({
          data: "",
          tipo: "",
          descricao: "Saldo",
          valor: (totalReceitas - totalDespesas).toFixed(2),
          status: "",
        });

        break;
      }

      case "ocupacao": {
        filename = `ocupacao_${formatDateForFile(new Date())}.xlsx`;
        const sheet = workbook.addWorksheet("Ocupação");

        sheet.columns = [
          { header: "Quarto", key: "numero", width: 10 },
          { header: "Status", key: "status", width: 15 },
          { header: "Paciente", key: "paciente", width: 30 },
        ];

        styleHeaderRow(sheet);

        const quartos = await prisma.quarto.findMany({
          include: {
            pacientes: {
              where: { deletedAt: null, status: "ATIVO" },
              select: { nome: true },
            },
          },
          orderBy: { numero: "asc" },
        });

        for (const quarto of quartos) {
          const pacienteNomes = quarto.pacientes.map((p) => p.nome).join(", ");
          sheet.addRow({
            numero: quarto.numero,
            status: translateStatusQuarto(quarto.status),
            paciente: pacienteNomes || "—",
          });
        }

        break;
      }
    }

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    await logAudit(session.userId, "READ", "Exportacao", undefined, {
      tipo,
      formato,
    });

    // Return as file download
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("GET /api/relatorios/exportar error:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao gerar exportação" },
      { status: 500 }
    );
  }
}

// Helper functions

function styleHeaderRow(sheet: ExcelJS.Worksheet): void {
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, size: 11 };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4472C4" },
  };
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("pt-BR");
}

function formatDateForFile(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatCPF(cpf: string): string {
  if (cpf.length === 11) {
    return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
  }
  return cpf;
}

function translateStatus(status: string): string {
  const map: Record<string, string> = {
    ATIVO: "Ativo",
    ALTA: "Alta",
    EVADIDO: "Evadido",
    TRANSFERIDO: "Transferido",
    OBITO: "Óbito",
  };
  return map[status] || status;
}

function translateStatusPagamento(status: string): string {
  const map: Record<string, string> = {
    PENDENTE: "Pendente",
    PAGO: "Pago",
    ATRASADO: "Atrasado",
    CANCELADO: "Cancelado",
  };
  return map[status] || status;
}

function translateStatusQuarto(status: string): string {
  const map: Record<string, string> = {
    DISPONIVEL: "Disponível",
    OCUPADO: "Ocupado",
    MANUTENCAO: "Manutenção",
    LIMPEZA: "Limpeza",
  };
  return map[status] || status;
}
