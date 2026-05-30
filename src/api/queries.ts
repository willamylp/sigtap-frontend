/**
 * Hooks React Query. Os recursos versionados recebem a competência global
 * (CompetenciaProvider) injetada nos params e na queryKey, de modo que trocar a
 * competência invalida/recarrega automaticamente as queries.
 */
import {
  keepPreviousData,
  useQueries,
  useQuery,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useCompetencia } from "@/hooks/useCompetencia";
import { apiGet } from "./client";
import * as api from "./endpoints";
import type {
  BaseListParams,
  Paginated,
  ProcedimentoDetail,
  ProcedimentoFiltros,
} from "./types";

/** Tempo de "frescor" generoso para dicionários estáveis. */
const STALE = {
  curto: 60_000, // 1 min — listas que variam por filtro
  longo: 30 * 60_000, // 30 min — dicionários/competências
};

export const queryKeys = {
  competencias: ["competencias"] as const,
  procedimentos: (f: ProcedimentoFiltros) => ["procedimentos", f] as const,
  procedimento: (co: string, comp?: string) =>
    ["procedimento", co, comp] as const,
  procRelation: (co: string, rel: string, comp: string | undefined, p?: BaseListParams) =>
    ["procedimento", co, "rel", rel, comp, p] as const,
  reversa: (kind: string, co: string, comp: string | undefined, p?: BaseListParams) =>
    ["reversa", kind, co, comp, p] as const,
  dicList: (resource: string, comp: string | undefined, p?: Record<string, unknown>) =>
    ["dic", resource, "list", comp, p] as const,
  dicDetail: (resource: string, key: string, comp: string | undefined) =>
    ["dic", resource, "detail", key, comp] as const,
};

// ── Competências ─────────────────────────────────────────────────────────────
export function useCompetencias() {
  return useQuery({
    queryKey: queryKeys.competencias,
    queryFn: ({ signal }) =>
      api.getCompetencias({ page_size: 200, ordering: "-codigo" }, signal),
    staleTime: STALE.longo,
  });
}

// ── Procedimentos ────────────────────────────────────────────────────────────
export function useProcedimentos(filtros: ProcedimentoFiltros) {
  const { competencia } = useCompetencia();
  const merged: ProcedimentoFiltros = { ...filtros, competencia };
  return useQuery({
    queryKey: queryKeys.procedimentos(merged),
    queryFn: ({ signal }) => api.getProcedimentos(merged, signal),
    placeholderData: keepPreviousData,
    staleTime: STALE.curto,
  });
}

export function useProcedimento(co: string | undefined) {
  const { competencia } = useCompetencia();
  return useQuery({
    queryKey: queryKeys.procedimento(co ?? "", competencia),
    queryFn: ({ signal }) => api.getProcedimento(co!, competencia, signal),
    enabled: !!co,
    staleTime: STALE.curto,
  });
}

// ── Relações do procedimento ─────────────────────────────────────────────────
export type ProcRelationKey =
  | "cids"
  | "ocupacoes"
  | "modalidades"
  | "servicos"
  | "habilitacoes"
  | "incrementos"
  | "compativeis"
  | "leitos"
  | "registros"
  | "detalhes"
  | "sia-sih"
  | "origem"
  | "regras-condicionadas"
  | "renases"
  | "redes"
  | "tuss";

const relationFetchers: Record<
  ProcRelationKey,
  (co: string, p: BaseListParams, s?: AbortSignal) => Promise<Paginated<unknown>>
> = {
  cids: api.getProcCids,
  ocupacoes: api.getProcOcupacoes,
  modalidades: api.getProcModalidades,
  servicos: api.getProcServicos,
  habilitacoes: api.getProcHabilitacoes,
  incrementos: api.getProcIncrementos,
  compativeis: api.getProcCompativeis,
  leitos: api.getProcLeitos,
  registros: api.getProcRegistros,
  detalhes: api.getProcDetalhes,
  "sia-sih": api.getProcSiaSih,
  origem: api.getProcOrigem,
  "regras-condicionadas": api.getProcRegrasCond,
  renases: api.getProcRenases,
  redes: api.getProcRedes,
  tuss: api.getProcTuss,
};

export function useProcRelation<T = unknown>(
  co: string,
  rel: ProcRelationKey,
  params: BaseListParams,
  options?: { enabled?: boolean }
) {
  const { competencia } = useCompetencia();
  const merged: BaseListParams = { ...params, competencia };
  return useQuery({
    queryKey: queryKeys.procRelation(co, rel, competencia, params),
    queryFn: ({ signal }) =>
      relationFetchers[rel](co, merged, signal) as Promise<Paginated<T>>,
    enabled: options?.enabled ?? true,
    placeholderData: keepPreviousData,
    staleTime: STALE.curto,
  });
}

const RELATION_KEYS = Object.keys(relationFetchers) as ProcRelationKey[];

/**
 * Probe leve (page_size=1) das contagens de cada relação — alimenta os badges
 * de contagem por aba e o desabilitar de abas vazias (PRD §11.2).
 */
export function useRelationCounts(co: string | undefined) {
  const { competencia } = useCompetencia();
  const results = useQueries({
    queries: RELATION_KEYS.map((rel) => ({
      queryKey: ["procedimento", co ?? "", "rel-count", rel, competencia] as const,
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        relationFetchers[rel](co!, { page_size: 1, competencia }, signal).then(
          (r) => r.count
        ),
      enabled: !!co,
      staleTime: STALE.curto,
    })),
  });

  const counts = {} as Partial<Record<ProcRelationKey, number | undefined>>;
  RELATION_KEYS.forEach((rel, i) => {
    counts[rel] = results[i]?.data;
  });
  return { counts, isLoading: results.some((r) => r.isLoading) };
}

// ── Consultas reversas ───────────────────────────────────────────────────────
export type ReversaKind = "cids" | "ocupacoes" | "modalidades" | "servicos" | "habilitacoes";

const reversaFetchers: Record<
  ReversaKind,
  (co: string, p: BaseListParams, s?: AbortSignal) => ReturnType<typeof api.getProcedimentosPorCid>
> = {
  cids: api.getProcedimentosPorCid,
  ocupacoes: api.getProcedimentosPorOcupacao,
  modalidades: api.getProcedimentosPorModalidade,
  servicos: api.getProcedimentosPorServico,
  habilitacoes: api.getProcedimentosPorHabilitacao,
};

export function useProcedimentosReversa(
  kind: ReversaKind,
  co: string | undefined,
  params: BaseListParams
) {
  const { competencia } = useCompetencia();
  const merged: BaseListParams = { ...params, competencia };
  return useQuery({
    queryKey: queryKeys.reversa(kind, co ?? "", competencia, params),
    queryFn: ({ signal }) => reversaFetchers[kind](co!, merged, signal),
    enabled: !!co,
    placeholderData: keepPreviousData,
    staleTime: STALE.curto,
  });
}

// ── Genéricos para dicionários (config-driven, baseados em path) ─────────────
/**
 * Hook genérico de lista de dicionário. `versioned` controla se a competência
 * global entra nos params/queryKey. Aceita filtros extras (ex.: co_grupo).
 */
export function useDictionaryList<T>(
  resource: string,
  basePath: string,
  params: BaseListParams & Record<string, string | number | undefined>,
  versioned: boolean,
  options?: { enabled?: boolean; staleTime?: number }
) {
  const { competencia } = useCompetencia();
  const comp = versioned ? competencia : undefined;
  const merged = versioned ? { ...params, competencia } : params;
  return useQuery({
    queryKey: queryKeys.dicList(resource, comp, params),
    queryFn: ({ signal }) =>
      apiGet<Paginated<T>>(`${basePath}/`, merged, signal),
    placeholderData: keepPreviousData,
    staleTime: options?.staleTime ?? STALE.longo,
    enabled: options?.enabled ?? true,
  });
}

export function useDictionaryDetail<T>(
  resource: string,
  basePath: string,
  key: string | undefined,
  versioned: boolean,
  options?: Partial<UseQueryOptions<T>>
) {
  const { competencia } = useCompetencia();
  const comp = versioned ? competencia : undefined;
  return useQuery({
    queryKey: queryKeys.dicDetail(resource, key ?? "", comp),
    queryFn: ({ signal }) =>
      apiGet<T>(
        `${basePath}/${encodeURIComponent(key!)}/`,
        versioned ? { competencia } : undefined,
        signal
      ),
    enabled: !!key,
    staleTime: STALE.longo,
    ...options,
  });
}

export type { ProcedimentoDetail };
