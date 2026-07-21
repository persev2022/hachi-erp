/**
 * Utilitários de formatação para geração de documentos.
 * Portado do scripts-adm-main/shared
 */

const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

/** Remove acentos e gera slug para nome de arquivo. */
export function toSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[<>:"/\\|?*]+/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();
}

/** Formata nome com inicial maiúscula em cada palavra. */
export function toTitleCase(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

/** Formata data (Date ou ISO string) para dd/MM/yyyy. */
export function formatDateBR(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  // Use UTC to avoid timezone shifts (dates stored as midnight UTC)
  const dia = String(d.getUTCDate()).padStart(2, "0");
  const mes = String(d.getUTCMonth() + 1).padStart(2, "0");
  const ano = d.getUTCFullYear();
  return `${dia}/${mes}/${ano}`;
}

/** Converte "dd/MM/yyyy" ou Date para formato extenso: "1 de junho de 2026" */
export function dataParaExtenso(date: Date | string): string {
  const d = typeof date === "string" ? parseDateBR(date) : date;
  return `${d.getUTCDate()} de ${MESES[d.getUTCMonth()]} de ${d.getUTCFullYear()}`;
}

/** Parseia "dd/MM/yyyy" para Date. Lança erro se inválida. */
export function parseDateBR(str: string): Date {
  const match = str.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) throw new Error(`Formato inválido: "${str}". Use dd/MM/yyyy`);
  const [, d, m, a] = match.map(Number);
  const date = new Date(a, m - 1, d);
  if (date.getFullYear() !== a || date.getMonth() !== m - 1 || date.getDate() !== d) {
    throw new Error(`Data inválida: "${str}"`);
  }
  return date;
}

/** Dias de tratamento → meses (30 dias/mês). */
export function diasParaMeses(dias: number): number {
  return Math.round(dias / 30);
}

/** Soma N meses a uma data. */
export function somarMeses(date: Date, meses: number): Date {
  const result = new Date(date);
  const diaOriginal = result.getDate();
  result.setMonth(result.getMonth() + meses);
  if (result.getDate() !== diaOriginal) {
    result.setDate(0);
  }
  return result;
}

/** Calcula primeiro vencimento (sempre mês seguinte à entrada). */
export function calcularPrimeiroVencimento(dataEntrada: Date, diaVencimento: number): Date {
  return new Date(dataEntrada.getFullYear(), dataEntrada.getMonth() + 1, diaVencimento);
}
