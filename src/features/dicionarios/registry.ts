/**
 * Registro config-driven dos dicionários/dimensões (PRD §11.4).
 *
 * Um único par de componentes (DictionaryList / DictionaryDetail) renderiza
 * todos os recursos a partir desta configuração:
 *  - `keyField` definido → recurso tem detalhe navegável (chave natural).
 *  - `keyField` ausente → recurso COMPOSTO (lookup por `id` interno não exposto
 *    na lista, §5.6): apenas lista com filtros.
 *  - `versioned` → injeta a competência global.
 *  - `reverse` → existe consulta reversa de procedimentos.
 */
import type { ReversaKind } from "@/api/queries";

export type DicCellKind =
  | "code"
  | "text"
  | "long"
  | "tpSexo"
  | "tpSiaSih"
  | "tpAgravo";

export interface DicColumn {
  field: string;
  header: string;
  kind?: DicCellKind;
  orderingField?: string;
  align?: "right";
  /** Esconder por padrão (continua disponível no seletor de colunas). */
  defaultHidden?: boolean;
}

export interface DicDetailField {
  label: string;
  field: string;
  kind?: DicCellKind;
}

export type DicGroup = "hierarquia" | "dimensoes" | "dicionarios";

export interface DictionaryConfig {
  key: string;
  label: string;
  labelSingular: string;
  basePath: string;
  keyField?: string;
  versioned: boolean;
  reverse?: ReversaKind;
  searchPlaceholder?: string;
  defaultOrdering?: string;
  columns: DicColumn[];
  detailFields?: DicDetailField[];
  filters?: { param: string; label: string }[];
  group: DicGroup;
}

const code = (field: string, header = "Código"): DicColumn => ({
  field,
  header,
  kind: "code",
});
const name = (field: string, header = "Nome"): DicColumn => ({ field, header });

export const DICTIONARIES: DictionaryConfig[] = [
  // ── Hierarquia ──────────────────────────────────────────────────────────
  {
    key: "grupos",
    label: "Grupos",
    labelSingular: "Grupo",
    basePath: "/grupos",
    keyField: "co_grupo",
    versioned: true,
    defaultOrdering: "co_grupo",
    group: "hierarquia",
    columns: [code("co_grupo"), name("no_grupo")],
  },
  {
    key: "subgrupos",
    label: "Subgrupos",
    labelSingular: "Subgrupo",
    basePath: "/subgrupos",
    versioned: true,
    defaultOrdering: "co_sub_grupo",
    group: "hierarquia",
    columns: [
      code("co_grupo", "Grupo"),
      code("co_sub_grupo", "Subgrupo"),
      name("no_sub_grupo"),
    ],
    filters: [
      { param: "co_grupo", label: "Grupo" },
      { param: "co_sub_grupo", label: "Subgrupo" },
    ],
  },
  {
    key: "formas-organizacao",
    label: "Formas de Organização",
    labelSingular: "Forma de Organização",
    basePath: "/formas-organizacao",
    versioned: true,
    defaultOrdering: "co_forma_organizacao",
    group: "hierarquia",
    columns: [
      code("co_grupo", "Grupo"),
      code("co_sub_grupo", "Subgrupo"),
      code("co_forma_organizacao", "Forma"),
      name("no_forma_organizacao"),
    ],
    filters: [
      { param: "co_grupo", label: "Grupo" },
      { param: "co_sub_grupo", label: "Subgrupo" },
      { param: "co_forma_organizacao", label: "Forma" },
    ],
  },

  // ── Dimensões versionadas ───────────────────────────────────────────────
  {
    key: "financiamentos",
    label: "Financiamentos",
    labelSingular: "Financiamento",
    basePath: "/financiamentos",
    keyField: "co_financiamento",
    versioned: true,
    defaultOrdering: "co_financiamento",
    group: "dimensoes",
    columns: [code("co_financiamento"), name("no_financiamento")],
  },
  {
    key: "rubricas",
    label: "Rubricas",
    labelSingular: "Rubrica",
    basePath: "/rubricas",
    keyField: "co_rubrica",
    versioned: true,
    defaultOrdering: "co_rubrica",
    group: "dimensoes",
    columns: [code("co_rubrica"), name("no_rubrica")],
  },
  {
    key: "modalidades",
    label: "Modalidades",
    labelSingular: "Modalidade",
    basePath: "/modalidades",
    keyField: "co_modalidade",
    versioned: true,
    reverse: "modalidades",
    defaultOrdering: "co_modalidade",
    group: "dimensoes",
    columns: [code("co_modalidade"), name("no_modalidade")],
  },
  {
    key: "registros",
    label: "Registros",
    labelSingular: "Registro",
    basePath: "/registros",
    keyField: "co_registro",
    versioned: true,
    defaultOrdering: "co_registro",
    group: "dimensoes",
    columns: [code("co_registro"), name("no_registro")],
  },
  {
    key: "servicos",
    label: "Serviços",
    labelSingular: "Serviço",
    basePath: "/servicos",
    keyField: "co_servico",
    versioned: true,
    reverse: "servicos",
    defaultOrdering: "co_servico",
    group: "dimensoes",
    columns: [code("co_servico"), name("no_servico")],
  },
  {
    key: "servico-classificacoes",
    label: "Serviços / Classificações",
    labelSingular: "Classificação de Serviço",
    basePath: "/servico-classificacoes",
    versioned: true,
    defaultOrdering: "co_servico",
    group: "dimensoes",
    columns: [
      code("co_servico", "Serviço"),
      code("co_classificacao", "Classificação"),
      name("no_classificacao"),
    ],
    filters: [
      { param: "co_servico", label: "Serviço" },
      { param: "co_classificacao", label: "Classificação" },
    ],
  },
  {
    key: "tipos-leito",
    label: "Tipos de Leito",
    labelSingular: "Tipo de Leito",
    basePath: "/tipos-leito",
    keyField: "co_tipo_leito",
    versioned: true,
    defaultOrdering: "co_tipo_leito",
    group: "dimensoes",
    columns: [code("co_tipo_leito"), name("no_tipo_leito")],
  },
  {
    key: "habilitacoes",
    label: "Habilitações",
    labelSingular: "Habilitação",
    basePath: "/habilitacoes",
    keyField: "co_habilitacao",
    versioned: true,
    reverse: "habilitacoes",
    defaultOrdering: "co_habilitacao",
    group: "dimensoes",
    columns: [code("co_habilitacao"), name("no_habilitacao")],
  },
  {
    key: "detalhes",
    label: "Detalhes",
    labelSingular: "Detalhe",
    basePath: "/detalhes",
    keyField: "co_detalhe",
    versioned: true,
    defaultOrdering: "co_detalhe",
    group: "dimensoes",
    columns: [code("co_detalhe"), name("no_detalhe")],
  },
  {
    key: "sia-sih",
    label: "SIA/SIH",
    labelSingular: "Procedimento SIA/SIH",
    basePath: "/sia-sih",
    versioned: true,
    defaultOrdering: "co_procedimento_sia_sih",
    group: "dimensoes",
    columns: [
      code("co_procedimento_sia_sih", "Código"),
      name("no_procedimento_sia_sih"),
      { field: "tp_procedimento", header: "Tipo", kind: "tpSiaSih" },
    ],
    filters: [
      { param: "co_procedimento_sia_sih", label: "Código SIA/SIH" },
      { param: "tp_procedimento", label: "Tipo (A/H)" },
    ],
  },

  // ── Dicionários sem competência (classe C) ──────────────────────────────
  {
    key: "cids",
    label: "CIDs",
    labelSingular: "CID",
    basePath: "/cids",
    keyField: "co_cid",
    versioned: false,
    reverse: "cids",
    defaultOrdering: "co_cid",
    searchPlaceholder: "Buscar CID por código ou nome…",
    group: "dicionarios",
    columns: [
      code("co_cid"),
      name("no_cid"),
      { field: "tp_sexo", header: "Sexo", kind: "tpSexo" },
      { field: "tp_agravo", header: "Agravo", kind: "tpAgravo", defaultHidden: true },
    ],
    detailFields: [
      { label: "Código", field: "co_cid", kind: "code" },
      { label: "Nome", field: "no_cid" },
      { label: "Sexo", field: "tp_sexo", kind: "tpSexo" },
      { label: "Agravo", field: "tp_agravo", kind: "tpAgravo" },
      { label: "Estádio", field: "tp_estadio" },
      { label: "Campos irradiados", field: "vl_campos_irradiados" },
    ],
  },
  {
    key: "ocupacoes",
    label: "Ocupações (CBO)",
    labelSingular: "Ocupação",
    basePath: "/ocupacoes",
    keyField: "co_ocupacao",
    versioned: false,
    reverse: "ocupacoes",
    defaultOrdering: "co_ocupacao",
    searchPlaceholder: "Buscar ocupação (CBO) por código ou nome…",
    group: "dicionarios",
    columns: [code("co_ocupacao"), name("no_ocupacao")],
  },
  {
    key: "grupos-habilitacao",
    label: "Grupos de Habilitação",
    labelSingular: "Grupo de Habilitação",
    basePath: "/grupos-habilitacao",
    keyField: "nu_grupo_habilitacao",
    versioned: false,
    defaultOrdering: "nu_grupo_habilitacao",
    group: "dicionarios",
    columns: [
      code("nu_grupo_habilitacao", "Número"),
      name("no_grupo_habilitacao"),
      { field: "ds_grupo_habilitacao", header: "Descrição", kind: "long", defaultHidden: true },
    ],
    detailFields: [
      { label: "Número", field: "nu_grupo_habilitacao", kind: "code" },
      { label: "Nome", field: "no_grupo_habilitacao" },
      { label: "Descrição", field: "ds_grupo_habilitacao", kind: "long" },
    ],
  },
  {
    key: "regras-condicionadas",
    label: "Regras Condicionadas",
    labelSingular: "Regra Condicionada",
    basePath: "/regras-condicionadas",
    keyField: "co_regra_condicionada",
    versioned: false,
    defaultOrdering: "co_regra_condicionada",
    group: "dicionarios",
    columns: [
      code("co_regra_condicionada"),
      name("no_regra_condicionada"),
      { field: "ds_regra_condicionada", header: "Descrição", kind: "long", defaultHidden: true },
    ],
    detailFields: [
      { label: "Código", field: "co_regra_condicionada", kind: "code" },
      { label: "Nome", field: "no_regra_condicionada" },
      { label: "Descrição", field: "ds_regra_condicionada", kind: "long" },
    ],
  },
  {
    key: "redes-atencao",
    label: "Redes de Atenção",
    labelSingular: "Rede de Atenção",
    basePath: "/redes-atencao",
    keyField: "co_rede_atencao",
    versioned: false,
    defaultOrdering: "co_rede_atencao",
    group: "dicionarios",
    columns: [code("co_rede_atencao"), name("no_rede_atencao")],
  },
  {
    key: "componentes-rede",
    label: "Componentes de Rede",
    labelSingular: "Componente de Rede",
    basePath: "/componentes-rede",
    keyField: "co_componente_rede",
    versioned: false,
    defaultOrdering: "co_componente_rede",
    group: "dicionarios",
    columns: [
      code("co_componente_rede"),
      name("no_componente_rede"),
      code("co_rede_atencao", "Rede"),
    ],
    detailFields: [
      { label: "Código", field: "co_componente_rede", kind: "code" },
      { label: "Nome", field: "no_componente_rede" },
      { label: "Rede de atenção", field: "co_rede_atencao", kind: "code" },
    ],
  },
  {
    key: "tuss",
    label: "TUSS",
    labelSingular: "Correlação TUSS",
    basePath: "/tuss",
    keyField: "co_tuss",
    versioned: false,
    defaultOrdering: "co_tuss",
    group: "dicionarios",
    columns: [code("co_tuss"), name("no_tuss")],
  },
  {
    key: "renases",
    label: "RENASES",
    labelSingular: "RENASES",
    basePath: "/renases",
    keyField: "co_renases",
    versioned: false,
    defaultOrdering: "co_renases",
    group: "dicionarios",
    columns: [code("co_renases"), name("no_renases")],
  },
];

export const DICTIONARY_BY_KEY: Record<string, DictionaryConfig> =
  Object.fromEntries(DICTIONARIES.map((d) => [d.key, d]));

export function getDictionary(key: string | undefined): DictionaryConfig | undefined {
  return key ? DICTIONARY_BY_KEY[key] : undefined;
}
