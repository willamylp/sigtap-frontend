/**
 * Tipos da API SIGTAP — escritos à mão a partir do OpenAPI (docs/SIGTAP_API.yaml)
 * já corrigindo os 3 descompasses documentados no PRD §5:
 *
 *  §5.2  Toda lista paginada inclui o campo `competencia` (ausente no OpenAPI).
 *  §5.3  As sub-rotas de procedimento (/cids/, /ocupacoes/, …) retornam LISTA
 *        paginada (no OpenAPI aparecem como objeto único).
 *  §5.6  Dicionários compostos (subgrupos, formas-organizacao,
 *        servico-classificacoes, sia-sih) não expõem `id` na lista.
 *
 * Códigos são SEMPRE strings (zeros à esquerda); valores monetários são strings
 * decimais (ex.: "98.95"). Ver PRD §5.5.
 */

/** Wrapper de paginação real do backend (PageNumberPagination + competencia). */
export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  /** Competência efetivamente consultada (§5.2). Ausente em recursos classe C. */
  competencia: string | null;
  results: T[];
}

// ── Competência ────────────────────────────────────────────────────────────
export interface Competencia {
  codigo: string; // AAAAMM
  vigente: boolean;
  importado_em: string; // ISO datetime
}

// ── Hierarquia ───────────────────────────────────────────────────────────────
export interface Grupo {
  co_grupo: string;
  no_grupo?: string;
}

export interface SubGrupo {
  co_grupo: string;
  co_sub_grupo: string;
  no_sub_grupo?: string;
}

export interface FormaOrganizacao {
  co_grupo: string;
  co_sub_grupo: string;
  co_forma_organizacao: string;
  no_forma_organizacao?: string;
}

// ── Dimensões versionadas ────────────────────────────────────────────────────
export interface Financiamento {
  co_financiamento: string;
  no_financiamento?: string;
}

export interface Rubrica {
  co_rubrica: string;
  no_rubrica?: string;
}

export interface Modalidade {
  co_modalidade: string;
  no_modalidade?: string;
}

export interface Registro {
  co_registro: string;
  no_registro?: string;
}

export interface Servico {
  co_servico: string;
  no_servico?: string;
}

export interface ServicoClassificacao {
  co_servico: string;
  co_classificacao: string;
  no_classificacao?: string;
}

export interface TipoLeito {
  co_tipo_leito: string;
  no_tipo_leito?: string;
}

export interface Habilitacao {
  co_habilitacao: string;
  no_habilitacao?: string;
}

export interface Detalhe {
  co_detalhe: string;
  no_detalhe?: string;
}

export interface SiaSih {
  co_procedimento_sia_sih: string;
  no_procedimento_sia_sih?: string;
  tp_procedimento?: string; // A/H
}

// ── Dicionários sem competência (classe C) ───────────────────────────────────
export interface Cid {
  co_cid: string;
  no_cid?: string;
  tp_agravo?: string;
  tp_sexo?: string;
  tp_estadio?: string;
  vl_campos_irradiados?: number | null;
}

export interface Ocupacao {
  co_ocupacao: string;
  no_ocupacao?: string;
}

export interface GrupoHabilitacao {
  nu_grupo_habilitacao: string;
  no_grupo_habilitacao?: string;
  ds_grupo_habilitacao?: string;
}

export interface RegraCondicionada {
  co_regra_condicionada: string;
  no_regra_condicionada?: string;
  ds_regra_condicionada?: string;
}

export interface RedeAtencao {
  co_rede_atencao: string;
  no_rede_atencao?: string;
}

export interface ComponenteRede {
  co_componente_rede: string;
  no_componente_rede?: string;
  co_rede_atencao: string;
}

export interface Tuss {
  co_tuss: string;
  no_tuss?: string;
}

export interface Renases {
  co_renases: string;
  no_renases?: string;
}

// ── Procedimento ─────────────────────────────────────────────────────────────
export interface ProcedimentoList {
  co_procedimento: string;
  no_procedimento?: string;
  tp_complexidade?: string;
  tp_sexo?: string;
  co_grupo?: string;
  co_sub_grupo?: string;
  co_forma_organizacao?: string;
  /** Na lista, `financiamento` é apenas o código (string). */
  financiamento: string;
  vl_sh?: string;
  vl_sa?: string;
  vl_sp?: string;
  competencia: string;
}

export interface ProcedimentoMini {
  co_procedimento: string;
  no_procedimento?: string;
}

export interface ProcedimentoDetail {
  co_procedimento: string;
  no_procedimento?: string;
  tp_complexidade?: string;
  tp_sexo?: string;
  qt_maxima_execucao?: number | null;
  qt_dias_permanencia?: number | null;
  qt_pontos?: number | null;
  vl_idade_minima?: number | null;
  vl_idade_maxima?: number | null;
  vl_sh?: string;
  vl_sa?: string;
  vl_sp?: string;
  qt_tempo_permanencia?: number | null;
  co_grupo?: string;
  co_sub_grupo?: string;
  co_forma_organizacao?: string;
  /** No detalhe, `financiamento` é o objeto completo. */
  financiamento: Financiamento;
  rubrica: Rubrica;
  forma_organizacao: FormaOrganizacao;
  descricao: string;
  competencia: string;
}

// ── Relações do procedimento (todas retornam Paginated<…> — §5.3) ────────────
export interface ProcedimentoCid {
  cid: Cid;
  st_principal?: boolean;
}

export interface ProcedimentoOcupacao {
  ocupacao: Ocupacao;
}

export interface ProcedimentoModalidade {
  modalidade: Modalidade;
}

export interface ProcedimentoServico {
  servico_classificacao: ServicoClassificacao;
}

export interface ProcedimentoLeito {
  tipo_leito: TipoLeito;
}

export interface ProcedimentoRegistro {
  registro: Registro;
}

export interface ProcedimentoDetalhe {
  detalhe: Detalhe;
}

export interface ProcedimentoHabilitacao {
  habilitacao: Habilitacao;
  nu_grupo_habilitacao?: string;
  grupo_habilitacao: GrupoHabilitacao;
}

export interface ProcedimentoIncremento {
  habilitacao: Habilitacao;
  vl_percentual_sh?: string;
  vl_percentual_sa?: string;
  vl_percentual_sp?: string;
}

export interface ProcedimentoCompativel {
  procedimento_compativel: ProcedimentoMini;
  registro_principal: string;
  registro_compativel: string;
  tp_compatibilidade?: string;
  qt_permitida?: number | null;
}

export interface ProcedimentoSiaSih {
  sia_sih: SiaSih;
  tp_procedimento?: string; // A/H
}

export interface ProcedimentoOrigem {
  procedimento_origem: ProcedimentoMini;
}

export interface ProcedimentoRegraCond {
  regra_condicionada: RegraCondicionada;
}

export interface ProcedimentoRenases {
  renases: Renases;
}

export interface ProcedimentoCompRede {
  componente_rede: ComponenteRede;
}

export interface ProcedimentoTuss {
  tuss: Tuss;
}

/** Endpoint opcional /procedimentos/{co}/descricao/. */
export interface ProcedimentoDescricao {
  co_procedimento: string;
  ds_procedimento: string;
}

// ── Filtros ──────────────────────────────────────────────────────────────────
/**
 * Parâmetros comuns a qualquer lista. A assinatura de índice permite usá-los
 * diretamente como bag de query params no cliente HTTP.
 */
export interface BaseListParams {
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
  competencia?: string;
  [key: string]: string | number | undefined;
}

export interface ProcedimentoFiltros extends BaseListParams {
  grupo?: string;
  sub_grupo?: string;
  forma_organizacao?: string;
  financiamento?: string;
  modalidade?: string;
  complexidade?: string;
  sexo?: string;
}
