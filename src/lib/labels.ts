/**
 * Rótulos dos códigos de domínio TP_* (PRD Anexo C).
 *
 * ⚠️ Estes significados NÃO vêm da API — são convenções de domínio do SIGTAP.
 * Centralizados aqui para validação/ajuste com a área de negócio. Códigos não
 * mapeados devem exibir o valor cru com tooltip "a confirmar" (ver TpBadge).
 */

export type BadgeTone =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

export interface LabelDef {
  label: string;
  tone: BadgeTone;
  /** true quando o significado ainda precisa ser confirmado com o negócio. */
  unconfirmed?: boolean;
}

export const TP_COMPLEXIDADE: Record<string, LabelDef> = {
  "0": { label: "Não se aplica", tone: "neutral" },
  "1": { label: "Atenção Básica", tone: "info" },
  "2": { label: "Média Complexidade", tone: "warning" },
  "3": { label: "Alta Complexidade", tone: "danger" },
};

export const TP_SEXO: Record<string, LabelDef> = {
  M: { label: "Masculino", tone: "info" },
  F: { label: "Feminino", tone: "primary" },
  I: { label: "Ambos/Indiferente", tone: "neutral" },
  N: { label: "Não se aplica", tone: "neutral" },
};

export const TP_PROCEDIMENTO_SIA_SIH: Record<string, LabelDef> = {
  A: { label: "Ambulatorial", tone: "info" },
  H: { label: "Hospitalar", tone: "primary" },
};

export const ST_PRINCIPAL: Record<string, LabelDef> = {
  true: { label: "CID principal", tone: "success" },
  false: { label: "CID secundário", tone: "neutral" },
};

/**
 * tp_compatibilidade ("1".."5") e tp_agravo ("0"/"2"): significados não
 * documentados. Exibimos o código cru marcado como "a confirmar".
 */
export const TP_COMPATIBILIDADE: Record<string, LabelDef> = {
  "1": { label: "Tipo 1", tone: "neutral", unconfirmed: true },
  "2": { label: "Tipo 2", tone: "neutral", unconfirmed: true },
  "3": { label: "Tipo 3", tone: "neutral", unconfirmed: true },
  "4": { label: "Tipo 4", tone: "neutral", unconfirmed: true },
  "5": { label: "Tipo 5", tone: "neutral", unconfirmed: true },
};

export const TP_AGRAVO: Record<string, LabelDef> = {
  "0": { label: "Tipo 0", tone: "neutral", unconfirmed: true },
  "2": { label: "Tipo 2", tone: "neutral", unconfirmed: true },
};

/** Resolve um código contra um mapa, com fallback "a confirmar". */
export function resolveLabel(
  map: Record<string, LabelDef>,
  code: string | null | undefined
): LabelDef | null {
  if (code == null || code === "") return null;
  const found = map[code];
  if (found) return found;
  return { label: code, tone: "neutral", unconfirmed: true };
}

/** Opções (value/label) de um mapa, úteis para selects de filtro. */
export function labelOptions(
  map: Record<string, LabelDef>
): { value: string; label: string }[] {
  return Object.entries(map).map(([value, def]) => ({
    value,
    label: def.label,
  }));
}
