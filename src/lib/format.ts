/**
 * Formatadores pt-BR. Ver PRD §5.5.
 *
 * Regras de ouro:
 *  - Códigos são strings com zeros à esquerda — NUNCA convertê-los para número.
 *  - Valores monetários chegam como string decimal (ex.: "98.95").
 *  - Idade vem em meses (inteiro) ou null.
 */

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const decimal = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const integer = new Intl.NumberFormat("pt-BR");

/**
 * Formata um valor monetário (string decimal vinda da API) como BRL.
 * Trata `null`/`undefined`/vazio como travessão.
 */
export function formatBRL(value: string | number | null | undefined): string {
  if (value == null || value === "") return "—";
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return "—";
  return brl.format(n);
}

/** Formata um percentual (string decimal) como "12,50 %". */
export function formatPercent(value: string | number | null | undefined): string {
  if (value == null || value === "") return "—";
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return "—";
  return `${decimal.format(n)} %`;
}

/** Formata um inteiro no padrão pt-BR; `null` → travessão. */
export function formatInt(value: number | null | undefined): string {
  if (value == null) return "—";
  return integer.format(value);
}

/**
 * Converte idade em meses para um rótulo amigável.
 *  - null/0 → "—"
 *  - múltiplos de 12 → "N ano(s)"
 *  - < 12 → "N mês(es)"
 *  - misto → "N ano(s) e M mês(es)"
 */
export function formatIdade(meses: number | null | undefined): string {
  if (meses == null || meses === 0) return "—";
  const anos = Math.floor(meses / 12);
  const restoMeses = meses % 12;

  const partes: string[] = [];
  if (anos > 0) partes.push(`${anos} ${anos === 1 ? "ano" : "anos"}`);
  if (restoMeses > 0)
    partes.push(`${restoMeses} ${restoMeses === 1 ? "mês" : "meses"}`);

  return partes.join(" e ");
}

/**
 * Formata a competência AAAAMM como "MM/AAAA".
 * Aceita valores já formatados ou nulos com fallback.
 */
export function formatCompetencia(
  competencia: string | null | undefined
): string {
  if (!competencia) return "—";
  if (/^\d{6}$/.test(competencia)) {
    return `${competencia.slice(4, 6)}/${competencia.slice(0, 4)}`;
  }
  return competencia;
}

/** Versão por extenso da competência: "maio de 2026". */
const MESES_EXTENSO = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

export function formatCompetenciaExtenso(
  competencia: string | null | undefined
): string {
  if (!competencia || !/^\d{6}$/.test(competencia)) return "—";
  const ano = competencia.slice(0, 4);
  const mes = Number(competencia.slice(4, 6));
  const nome = MESES_EXTENSO[mes - 1];
  return nome ? `${nome} de ${ano}` : formatCompetencia(competencia);
}

/** Formata uma data ISO como dd/mm/aaaa. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR").format(d);
}

/** Texto truncado com reticências (usado em tooltips de células). */
export function truncate(text: string, max = 80): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}
