/**
 * Funções por recurso da API SIGTAP. Camada fina sobre `apiGet`.
 *
 * Todas as listas retornam `Paginated<T>` (inclusive as relações — §5.3).
 * `competencia` é apenas mais um query param; quem injeta a competência global
 * é a camada de hooks (queries.ts) a partir do CompetenciaProvider.
 */
import { apiGet, type QueryParams } from "./client";
import type {
  BaseListParams,
  Cid,
  Competencia,
  ComponenteRede,
  Detalhe,
  Financiamento,
  FormaOrganizacao,
  Grupo,
  GrupoHabilitacao,
  Habilitacao,
  Modalidade,
  Ocupacao,
  Paginated,
  ProcedimentoCid,
  ProcedimentoCompRede,
  ProcedimentoCompativel,
  ProcedimentoDetail,
  ProcedimentoDetalhe,
  ProcedimentoFiltros,
  ProcedimentoHabilitacao,
  ProcedimentoIncremento,
  ProcedimentoLeito,
  ProcedimentoList,
  ProcedimentoModalidade,
  ProcedimentoOcupacao,
  ProcedimentoOrigem,
  ProcedimentoRegistro,
  ProcedimentoRegraCond,
  ProcedimentoRenases,
  ProcedimentoServico,
  ProcedimentoSiaSih,
  ProcedimentoTuss,
  RedeAtencao,
  Registro,
  RegraCondicionada,
  Renases,
  Rubrica,
  Servico,
  ServicoClassificacao,
  SiaSih,
  SubGrupo,
  TipoLeito,
  Tuss,
} from "./types";

const enc = encodeURIComponent;

/** Helper genérico para listas paginadas. */
function list<T>(
  path: string,
  params?: QueryParams,
  signal?: AbortSignal
): Promise<Paginated<T>> {
  return apiGet<Paginated<T>>(path, params, signal);
}

/** Helper genérico para detalhe por chave. */
function retrieve<T>(path: string, signal?: AbortSignal): Promise<T> {
  return apiGet<T>(path, undefined, signal);
}

// ── Competências ─────────────────────────────────────────────────────────────
export const getCompetencias = (p?: BaseListParams, s?: AbortSignal) =>
  list<Competencia>("/competencias/", p, s);

// ── Procedimentos ────────────────────────────────────────────────────────────
export const getProcedimentos = (p: ProcedimentoFiltros, s?: AbortSignal) =>
  list<ProcedimentoList>("/procedimentos/", p, s);

export const getProcedimento = (co: string, competencia?: string, s?: AbortSignal) =>
  apiGet<ProcedimentoDetail>(
    `/procedimentos/${enc(co)}/`,
    competencia ? { competencia } : undefined,
    s
  );

// ── Relações do procedimento (todas paginadas — §5.3) ────────────────────────
type RelParams = BaseListParams;

export const getProcCids = (co: string, p?: RelParams, s?: AbortSignal) =>
  list<ProcedimentoCid>(`/procedimentos/${enc(co)}/cids/`, p, s);

export const getProcOcupacoes = (co: string, p?: RelParams, s?: AbortSignal) =>
  list<ProcedimentoOcupacao>(`/procedimentos/${enc(co)}/ocupacoes/`, p, s);

export const getProcModalidades = (co: string, p?: RelParams, s?: AbortSignal) =>
  list<ProcedimentoModalidade>(`/procedimentos/${enc(co)}/modalidades/`, p, s);

export const getProcServicos = (co: string, p?: RelParams, s?: AbortSignal) =>
  list<ProcedimentoServico>(`/procedimentos/${enc(co)}/servicos/`, p, s);

export const getProcLeitos = (co: string, p?: RelParams, s?: AbortSignal) =>
  list<ProcedimentoLeito>(`/procedimentos/${enc(co)}/leitos/`, p, s);

export const getProcRegistros = (co: string, p?: RelParams, s?: AbortSignal) =>
  list<ProcedimentoRegistro>(`/procedimentos/${enc(co)}/registros/`, p, s);

export const getProcDetalhes = (co: string, p?: RelParams, s?: AbortSignal) =>
  list<ProcedimentoDetalhe>(`/procedimentos/${enc(co)}/detalhes/`, p, s);

export const getProcHabilitacoes = (co: string, p?: RelParams, s?: AbortSignal) =>
  list<ProcedimentoHabilitacao>(`/procedimentos/${enc(co)}/habilitacoes/`, p, s);

export const getProcIncrementos = (co: string, p?: RelParams, s?: AbortSignal) =>
  list<ProcedimentoIncremento>(`/procedimentos/${enc(co)}/incrementos/`, p, s);

export const getProcCompativeis = (co: string, p?: RelParams, s?: AbortSignal) =>
  list<ProcedimentoCompativel>(`/procedimentos/${enc(co)}/compativeis/`, p, s);

export const getProcSiaSih = (co: string, p?: RelParams, s?: AbortSignal) =>
  list<ProcedimentoSiaSih>(`/procedimentos/${enc(co)}/sia-sih/`, p, s);

export const getProcOrigem = (co: string, p?: RelParams, s?: AbortSignal) =>
  list<ProcedimentoOrigem>(`/procedimentos/${enc(co)}/origem/`, p, s);

export const getProcRegrasCond = (co: string, p?: RelParams, s?: AbortSignal) =>
  list<ProcedimentoRegraCond>(
    `/procedimentos/${enc(co)}/regras-condicionadas/`,
    p,
    s
  );

export const getProcRenases = (co: string, p?: RelParams, s?: AbortSignal) =>
  list<ProcedimentoRenases>(`/procedimentos/${enc(co)}/renases/`, p, s);

export const getProcRedes = (co: string, p?: RelParams, s?: AbortSignal) =>
  list<ProcedimentoCompRede>(`/procedimentos/${enc(co)}/redes/`, p, s);

export const getProcTuss = (co: string, p?: RelParams, s?: AbortSignal) =>
  list<ProcedimentoTuss>(`/procedimentos/${enc(co)}/tuss/`, p, s);

// ── Consultas reversas (→ ProcedimentoList) ──────────────────────────────────
export const getProcedimentosPorCid = (co: string, p?: BaseListParams, s?: AbortSignal) =>
  list<ProcedimentoList>(`/cids/${enc(co)}/procedimentos/`, p, s);

export const getProcedimentosPorOcupacao = (co: string, p?: BaseListParams, s?: AbortSignal) =>
  list<ProcedimentoList>(`/ocupacoes/${enc(co)}/procedimentos/`, p, s);

export const getProcedimentosPorModalidade = (co: string, p?: BaseListParams, s?: AbortSignal) =>
  list<ProcedimentoList>(`/modalidades/${enc(co)}/procedimentos/`, p, s);

export const getProcedimentosPorServico = (co: string, p?: BaseListParams, s?: AbortSignal) =>
  list<ProcedimentoList>(`/servicos/${enc(co)}/procedimentos/`, p, s);

export const getProcedimentosPorHabilitacao = (co: string, p?: BaseListParams, s?: AbortSignal) =>
  list<ProcedimentoList>(`/habilitacoes/${enc(co)}/procedimentos/`, p, s);

// ── Hierarquia (cascata) ─────────────────────────────────────────────────────
export const getGrupos = (p?: BaseListParams, s?: AbortSignal) =>
  list<Grupo>("/grupos/", p, s);
export const getGrupo = (co: string, s?: AbortSignal) =>
  retrieve<Grupo>(`/grupos/${enc(co)}/`, s);

export const getSubgrupos = (
  p?: BaseListParams & { co_grupo?: string; co_sub_grupo?: string },
  s?: AbortSignal
) => list<SubGrupo>("/subgrupos/", p, s);

export const getFormasOrganizacao = (
  p?: BaseListParams & {
    co_grupo?: string;
    co_sub_grupo?: string;
    co_forma_organizacao?: string;
  },
  s?: AbortSignal
) => list<FormaOrganizacao>("/formas-organizacao/", p, s);

// ── Dimensões versionadas ────────────────────────────────────────────────────
export const getFinanciamentos = (p?: BaseListParams, s?: AbortSignal) =>
  list<Financiamento>("/financiamentos/", p, s);
export const getFinanciamento = (co: string, s?: AbortSignal) =>
  retrieve<Financiamento>(`/financiamentos/${enc(co)}/`, s);

export const getRubricas = (p?: BaseListParams, s?: AbortSignal) =>
  list<Rubrica>("/rubricas/", p, s);
export const getRubrica = (co: string, s?: AbortSignal) =>
  retrieve<Rubrica>(`/rubricas/${enc(co)}/`, s);

export const getModalidades = (p?: BaseListParams, s?: AbortSignal) =>
  list<Modalidade>("/modalidades/", p, s);
export const getModalidade = (co: string, s?: AbortSignal) =>
  retrieve<Modalidade>(`/modalidades/${enc(co)}/`, s);

export const getRegistros = (p?: BaseListParams, s?: AbortSignal) =>
  list<Registro>("/registros/", p, s);
export const getRegistro = (co: string, s?: AbortSignal) =>
  retrieve<Registro>(`/registros/${enc(co)}/`, s);

export const getServicos = (p?: BaseListParams, s?: AbortSignal) =>
  list<Servico>("/servicos/", p, s);
export const getServico = (co: string, s?: AbortSignal) =>
  retrieve<Servico>(`/servicos/${enc(co)}/`, s);

export const getServicoClassificacoes = (
  p?: BaseListParams & { co_servico?: string; co_classificacao?: string },
  s?: AbortSignal
) => list<ServicoClassificacao>("/servico-classificacoes/", p, s);

export const getTiposLeito = (p?: BaseListParams, s?: AbortSignal) =>
  list<TipoLeito>("/tipos-leito/", p, s);
export const getTipoLeito = (co: string, s?: AbortSignal) =>
  retrieve<TipoLeito>(`/tipos-leito/${enc(co)}/`, s);

export const getHabilitacoes = (p?: BaseListParams, s?: AbortSignal) =>
  list<Habilitacao>("/habilitacoes/", p, s);
export const getHabilitacao = (co: string, s?: AbortSignal) =>
  retrieve<Habilitacao>(`/habilitacoes/${enc(co)}/`, s);

export const getDetalhesDic = (p?: BaseListParams, s?: AbortSignal) =>
  list<Detalhe>("/detalhes/", p, s);
export const getDetalhe = (co: string, s?: AbortSignal) =>
  retrieve<Detalhe>(`/detalhes/${enc(co)}/`, s);

export const getSiaSihDic = (
  p?: BaseListParams & { co_procedimento_sia_sih?: string; tp_procedimento?: string },
  s?: AbortSignal
) => list<SiaSih>("/sia-sih/", p, s);

// ── Dicionários sem competência (classe C) ───────────────────────────────────
export const getCids = (p?: BaseListParams, s?: AbortSignal) =>
  list<Cid>("/cids/", p, s);
export const getCid = (co: string, s?: AbortSignal) =>
  retrieve<Cid>(`/cids/${enc(co)}/`, s);

export const getOcupacoes = (p?: BaseListParams, s?: AbortSignal) =>
  list<Ocupacao>("/ocupacoes/", p, s);
export const getOcupacao = (co: string, s?: AbortSignal) =>
  retrieve<Ocupacao>(`/ocupacoes/${enc(co)}/`, s);

export const getGruposHabilitacao = (p?: BaseListParams, s?: AbortSignal) =>
  list<GrupoHabilitacao>("/grupos-habilitacao/", p, s);
export const getGrupoHabilitacao = (co: string, s?: AbortSignal) =>
  retrieve<GrupoHabilitacao>(`/grupos-habilitacao/${enc(co)}/`, s);

export const getRegrasCondicionadas = (p?: BaseListParams, s?: AbortSignal) =>
  list<RegraCondicionada>("/regras-condicionadas/", p, s);
export const getRegraCondicionada = (co: string, s?: AbortSignal) =>
  retrieve<RegraCondicionada>(`/regras-condicionadas/${enc(co)}/`, s);

export const getRedesAtencao = (p?: BaseListParams, s?: AbortSignal) =>
  list<RedeAtencao>("/redes-atencao/", p, s);
export const getRedeAtencao = (co: string, s?: AbortSignal) =>
  retrieve<RedeAtencao>(`/redes-atencao/${enc(co)}/`, s);

export const getComponentesRede = (p?: BaseListParams, s?: AbortSignal) =>
  list<ComponenteRede>("/componentes-rede/", p, s);
export const getComponenteRede = (co: string, s?: AbortSignal) =>
  retrieve<ComponenteRede>(`/componentes-rede/${enc(co)}/`, s);

export const getTuss = (p?: BaseListParams, s?: AbortSignal) =>
  list<Tuss>("/tuss/", p, s);
export const getTussItem = (co: string, s?: AbortSignal) =>
  retrieve<Tuss>(`/tuss/${enc(co)}/`, s);

export const getRenases = (p?: BaseListParams, s?: AbortSignal) =>
  list<Renases>("/renases/", p, s);
export const getRenasesItem = (co: string, s?: AbortSignal) =>
  retrieve<Renases>(`/renases/${enc(co)}/`, s);
