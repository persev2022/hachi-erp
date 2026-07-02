/**
 * Utilitários de valor monetário para documentos.
 * Portado do scripts-adm-main/shared/valor.js
 */

// @ts-ignore - numero-por-extenso doesn't have types
import { porExtenso, estilo } from "numero-por-extenso";

/** Formata valor numérico para pt-BR com 2 casas decimais. */
export function formatarValorNum(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Valor numérico para extenso monetário. */
export function valorPorExtenso(valor: number): string {
  return porExtenso(valor, estilo.monetario);
}

/**
 * Formata valor no padrão contrato: "R$2.000,00 (dois mil reais)"
 */
export function formatarValorContrato(valor: number): string {
  const num = formatarValorNum(valor);
  const extenso = valorPorExtenso(valor);
  return `R$${num} (${extenso})`;
}

/**
 * Retorna { valorNum, valorExtenso } para uso em recibos.
 */
export function formatarValor(valor: number): { valorNum: string; valorExtenso: string } {
  return {
    valorNum: formatarValorNum(valor),
    valorExtenso: valorPorExtenso(valor),
  };
}
