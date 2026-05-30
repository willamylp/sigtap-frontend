/**
 * Helpers para sincronizar filtros ↔ querystring (PRD §7, §8.2).
 * O estado de consulta vive na URL para ser compartilhável/bookmarkável.
 */
import type { ProcedimentoFiltros } from "@/api/types";

/** Lê um parâmetro string da URL, normalizando vazio para undefined. */
export function readParam(
  sp: URLSearchParams,
  key: string
): string | undefined {
  const v = sp.get(key);
  return v == null || v === "" ? undefined : v;
}

/** Lê um inteiro da URL com fallback. */
export function readIntParam(
  sp: URLSearchParams,
  key: string,
  fallback: number
): number {
  const v = sp.get(key);
  if (v == null) return fallback;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

/**
 * Aplica um patch de chaves/valores a um URLSearchParams existente, removendo
 * as que ficarem vazias/nulas. Retorna um NOVO URLSearchParams.
 */
export function patchSearchParams(
  current: URLSearchParams,
  patch: Record<string, string | number | undefined | null>
): URLSearchParams {
  const next = new URLSearchParams(current);
  for (const [key, value] of Object.entries(patch)) {
    if (value == null || value === "") {
      next.delete(key);
    } else {
      next.set(key, String(value));
    }
  }
  return next;
}

export const DEFAULT_PAGE_SIZE = 50;
export const PAGE_SIZE_OPTIONS = [25, 50, 100, 200];

/** Extrai os filtros de procedimentos da URL (sem competência — vem do provider). */
export function readProcedimentoFiltros(
  sp: URLSearchParams
): ProcedimentoFiltros {
  return {
    search: readParam(sp, "search"),
    grupo: readParam(sp, "grupo"),
    sub_grupo: readParam(sp, "sub_grupo"),
    forma_organizacao: readParam(sp, "forma_organizacao"),
    financiamento: readParam(sp, "financiamento"),
    modalidade: readParam(sp, "modalidade"),
    complexidade: readParam(sp, "complexidade"),
    sexo: readParam(sp, "sexo"),
    ordering: readParam(sp, "ordering") ?? "co_procedimento",
    page: readIntParam(sp, "page", 1),
    page_size: readIntParam(sp, "page_size", DEFAULT_PAGE_SIZE),
  };
}
