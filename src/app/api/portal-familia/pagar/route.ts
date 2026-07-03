import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import QRCode from "qrcode";

/**
 * POST: Generate Pix QR Code for family payment.
 * Uses static Pix (copia e cola) — works without bank API.
 * Requires PIX_CHAVE to be configured in integrations settings.
 */
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("X-Family-Token");
    if (!token) {
      return NextResponse.json({ success: false, error: "Token não fornecido" }, { status: 401 });
    }

    const cleanToken = token.replace(/[-\s]/g, "");
    const familyToken = await prisma.familyToken.findUnique({
      where: { token: cleanToken },
      include: {
        paciente: {
          select: {
            id: true,
            nome: true,
            mensalidadeValor: true,
            diaVencimento: true,
          },
        },
      },
    });

    if (!familyToken || !familyToken.active) {
      return NextResponse.json({ success: false, error: "Token inválido" }, { status: 401 });
    }

    const paciente = familyToken.paciente;
    const valor = paciente.mensalidadeValor;

    if (!valor || valor <= 0) {
      return NextResponse.json(
        { success: false, error: "Valor da mensalidade não cadastrado para este paciente" },
        { status: 400 }
      );
    }

    // Get Pix key from settings
    let pixChave = process.env.PIX_CHAVE || "";
    let pixNome = "Hachi Clinica";

    if (!pixChave) {
      const config = await prisma.systemConfig.findUnique({ where: { key: "integracoes" } });
      if (config) {
        try {
          const settings = JSON.parse(config.value);
          pixChave = settings.pix?.pixKey || "";
        } catch {}
      }
    }

    // Get clinic name
    const clinicaConfig = await prisma.systemConfig.findUnique({ where: { key: "clinica" } });
    if (clinicaConfig) {
      try {
        const clinica = JSON.parse(clinicaConfig.value);
        pixNome = clinica.nomeFantasia || clinica.razaoSocial || "Hachi Clinica";
      } catch {}
    }

    if (!pixChave) {
      return NextResponse.json(
        { success: false, error: "Chave Pix não configurada. Contate a administração." },
        { status: 400 }
      );
    }

    // Generate Pix payload (BR Code / EMV standard)
    const pixPayload = generatePixPayload({
      chave: pixChave,
      nome: pixNome.slice(0, 25), // max 25 chars
      cidade: "FLORIANOPOLIS", // Will be overridden by clinic config
      valor: valor,
      descricao: `Mensalidade ${paciente.nome.split(" ")[0]}`,
    });

    // Generate QR Code as data URL (base64 PNG)
    const qrDataUrl = await QRCode.toDataURL(pixPayload, {
      width: 300,
      margin: 2,
      color: { dark: "#000000", light: "#FFFFFF" },
    });

    return NextResponse.json({
      success: true,
      data: {
        qrCode: qrDataUrl,
        pixCopiaECola: pixPayload,
        valor: valor,
        valorFormatado: `R$ ${valor.toFixed(2).replace(".", ",")}`,
        paciente: paciente.nome,
        vencimento: paciente.diaVencimento,
        beneficiario: pixNome,
      },
    });
  } catch (error) {
    console.error("Portal familia pagar error:", error);
    return NextResponse.json({ success: false, error: "Erro ao gerar pagamento" }, { status: 500 });
  }
}

/**
 * Generate static Pix payload (BR Code EMV format).
 * Follows BACEN specification for Pix Copia e Cola.
 */
function generatePixPayload(params: {
  chave: string;
  nome: string;
  cidade: string;
  valor: number;
  descricao?: string;
}): string {
  const { chave, nome, cidade, valor, descricao } = params;

  // Determine key type for merchant account info
  const merchantAccountInfo = buildTLV("00", "br.gov.bcb.pix") +
    buildTLV("01", chave) +
    (descricao ? buildTLV("02", descricao.slice(0, 35)) : "");

  const payload =
    buildTLV("00", "01") + // Payload Format Indicator
    buildTLV("01", "12") + // Point of Initiation (12 = dynamic)
    buildTLV("26", merchantAccountInfo) + // Merchant Account Info
    buildTLV("52", "0000") + // Merchant Category Code
    buildTLV("53", "986") + // Transaction Currency (BRL)
    buildTLV("54", valor.toFixed(2)) + // Transaction Amount
    buildTLV("58", "BR") + // Country Code
    buildTLV("59", nome) + // Merchant Name
    buildTLV("60", cidade) + // Merchant City
    buildTLV("62", buildTLV("05", "***")); // Additional Data (txid)

  // Add CRC16 (placeholder + calculate)
  const payloadWithCrc = payload + "6304";
  const crc = crc16(payloadWithCrc);
  return payloadWithCrc + crc;
}

function buildTLV(id: string, value: string): string {
  const length = value.length.toString().padStart(2, "0");
  return `${id}${length}${value}`;
}

function crc16(str: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
      crc &= 0xFFFF;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}
