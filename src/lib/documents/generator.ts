/**
 * Core document generator using docxtemplater.
 * Server-side only — generates .docx buffers from templates.
 */

import fs from "fs";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

const TEMPLATES_DIR = path.join(process.cwd(), "src/lib/documents/templates");

export type TemplateType =
  | "CONTRATO"
  | "RECIBO"
  | "RECEITA_SIMPLES"
  | "RECEITA_ESPECIAL"
  | "ATESTADO";

const TEMPLATE_FILES: Record<TemplateType, string> = {
  CONTRATO: "CONTRATO2026.docx",
  RECIBO: "Recibo.docx",
  RECEITA_SIMPLES: "receituario-simples.docx",
  RECEITA_ESPECIAL: "receita-especial.docx",
  ATESTADO: "ATESTADO.docx",
};

/**
 * Generates a .docx buffer from a template with the given data.
 * @returns Buffer containing the .docx file
 */
export function generateDocx(
  templateType: TemplateType,
  data: Record<string, string | number | undefined>
): Buffer {
  const templateFile = TEMPLATE_FILES[templateType];
  if (!templateFile) {
    throw new Error(`Template não encontrado: ${templateType}`);
  }

  const templatePath = path.join(TEMPLATES_DIR, templateFile);

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Arquivo de template não encontrado: ${templatePath}`);
  }

  const content = fs.readFileSync(templatePath, "binary");
  const zip = new PizZip(content);

  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  // Filter out undefined values
  const cleanData: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      cleanData[key] = value;
    }
  }

  doc.render(cleanData);

  return doc.getZip().generate({ type: "nodebuffer" }) as Buffer;
}

/** Lists available template types */
export function getAvailableTemplates(): TemplateType[] {
  return Object.keys(TEMPLATE_FILES) as TemplateType[];
}
