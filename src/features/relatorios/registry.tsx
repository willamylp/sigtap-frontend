/**
 * Registro config-driven dos Relatórios de Relacionamentos (PRD
 * prd-relatorios-relacionamentos-sigtap §4 / §6.1).
 *
 * Um único componente de tela (`RelatorioRelacionamento`) renderiza todos os
 * relatórios a partir desta configuração — mesmo padrão dos Dicionários
 * (registry de `features/dicionarios`). Cada relatório define:
 *  - o **sentido direto** ("Por Procedimento") sempre presente, sobre as
 *    sub-rotas do procedimento (`/procedimentos/{co}/<rel>/`);
 *  - opcionalmente o **sentido reverso** ("Por <Entidade>"), quando o backend
 *    expõe `/<entidade>/{co}/procedimentos/` (§5.2 / §6.3);
 *  - opcionalmente uma **visão alternativa** do sentido direto (ex.: Incremento
 *    dentro do relatório de Habilitação, §4.1 #8);
 *  - **filtros extras** client-side (Tipo CID, Categoria de CBO — §7).
 */
import type { ColumnDef } from "@tanstack/react-table";
import {
  BadgeCheck,
  Briefcase,
  ClipboardList,
  ConciergeBell,
  FileSpreadsheet,
  GitBranch,
  Hash,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";
import type { ProcRelationKey, ReversaKind } from "@/api/queries";
import {
  getCids,
  getHabilitacoes,
  getOcupacoes,
  getServicos,
} from "@/api/endpoints";
import type {
  Paginated,
  ProcedimentoCid,
  ProcedimentoHabilitacao,
  ProcedimentoIncremento,
  ProcedimentoOcupacao,
  ProcedimentoRegistro,
  ProcedimentoRegraCond,
  ProcedimentoServico,
  ProcedimentoSiaSih,
  ProcedimentoTuss,
} from "@/api/types";
import { CopyCode } from "@/components/common/CopyCode";
import { PercentCell } from "@/components/common/cells";
import { TpBadge } from "@/components/common/TpBadge";
import { truncate } from "@/lib/format";
import {
  ST_PRINCIPAL,
  TP_PROCEDIMENTO_SIA_SIH,
  TP_SEXO,
} from "@/lib/labels";

/** Base de rota da seção (RF-10). */
export const RELATORIOS_BASE = "/relatorios/relacionamentos";
export const relatorioPath = (slug: string) => `${RELATORIOS_BASE}/${slug}`;

export type FiltroExtra = "tipoCid" | "categoriaCbo";

/** Visão do sentido direto (base ou alternativa, ex.: Incremento). */
export interface RelatorioVisao {
  id: string;
  /** Relação (sub-rota) do procedimento consultada. */
  rel: ProcRelationKey;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  colunas: ColumnDef<any>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getRowKey: (row: any) => string;
}

export interface RelatorioReverso {
  kind: ReversaKind;
  /** Chave de cache do combobox de âncora. */
  resource: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fetchOpcoes: (search: string, page: number) => Promise<Paginated<any>>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getValue: (item: any) => string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getLabel: (item: any) => string;
}

export interface RelatorioConfig {
  slug: string;
  titulo: string;
  /** Rótulo da entidade (toggle "Por <Entidade>"). */
  entidadeLabel: string;
  entidadeLabelSingular: string;
  descricao: string;
  icon: LucideIcon;
  atalhoHome?: boolean;
  /** Sentido "Por Procedimento" (sempre presente). */
  direto: RelatorioVisao;
  /** Visão alternativa do sentido direto (ex.: Incremento da Habilitação). */
  diretoAlt?: RelatorioVisao & { label: string; baseLabel: string };
  /** Sentido "Por <Entidade>" (quando houver endpoint reverso). */
  reverso?: RelatorioReverso;
  filtrosExtras?: FiltroExtra[];
}

// ── Helpers de coluna (sentido direto) ───────────────────────────────────────
const nameCell = (text: string | undefined) => (
  <span title={text} className="block max-w-[24rem] truncate">
    {text ?? "—"}
  </span>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function codeCol(id: string, header: string, get: (r: any) => string): ColumnDef<any> {
  return {
    id,
    header,
    cell: ({ row }) => <CopyCode value={get(row.original)} />,
    meta: { csvHeader: header, csvValue: (r) => get(r) },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function monoCol(id: string, header: string, get: (r: any) => string | undefined): ColumnDef<any> {
  return {
    id,
    header,
    cell: ({ row }) => (
      <span className="font-mono text-[0.8125rem] tabular-nums">
        {get(row.original) ?? "—"}
      </span>
    ),
    meta: { csvHeader: header, csvValue: (r) => get(r) ?? "" },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function textCol(id: string, header: string, get: (r: any) => string | undefined): ColumnDef<any> {
  return {
    id,
    header,
    cell: ({ row }) => nameCell(get(row.original)),
    meta: { csvHeader: header, csvValue: (r) => get(r) ?? "" },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pctCol(id: string, header: string, get: (r: any) => string | undefined): ColumnDef<any> {
  return {
    id,
    header,
    cell: ({ row }) => <PercentCell value={get(row.original)} />,
    meta: { align: "right", csvHeader: header, csvValue: (r) => get(r) ?? "" },
  };
}

// ── Configuração dos 8 relatórios (RF-02, nesta ordem) ───────────────────────
export const RELATORIOS: RelatorioConfig[] = [
  // 1 ─ Procedimento × CBO ⭐ (bidirecional)
  {
    slug: "procedimento-cbo",
    titulo: "Procedimento × CBO",
    entidadeLabel: "CBO",
    entidadeLabelSingular: "CBO",
    descricao: "Ocupações (CBO) habilitadas a registrar cada procedimento.",
    icon: Briefcase,
    atalhoHome: true,
    filtrosExtras: ["categoriaCbo"],
    direto: {
      id: "ocupacoes",
      rel: "ocupacoes",
      getRowKey: (r: ProcedimentoOcupacao) => r.ocupacao.co_ocupacao,
      colunas: [
        codeCol("co_ocupacao", "CBO", (r: ProcedimentoOcupacao) => r.ocupacao.co_ocupacao),
        textCol("no_ocupacao", "Ocupação", (r: ProcedimentoOcupacao) => r.ocupacao.no_ocupacao),
      ],
    },
    reverso: {
      kind: "ocupacoes",
      resource: "rel-cbo",
      fetchOpcoes: (search, page) =>
        getOcupacoes({ search: search || undefined, page, page_size: 20 }),
      getValue: (o) => o.co_ocupacao,
      getLabel: (o) => `${o.co_ocupacao} — ${o.no_ocupacao ?? ""}`.trim(),
    },
  },

  // 2 ─ Procedimento × CID ⭐ (bidirecional)
  {
    slug: "procedimento-cid",
    titulo: "Procedimento × CID",
    entidadeLabel: "CID",
    entidadeLabelSingular: "CID",
    descricao: "CIDs (principais e secundários) associados a cada procedimento.",
    icon: Stethoscope,
    atalhoHome: true,
    filtrosExtras: ["tipoCid"],
    direto: {
      id: "cids",
      rel: "cids",
      getRowKey: (r: ProcedimentoCid) => r.cid.co_cid,
      colunas: [
        codeCol("co_cid", "CID", (r: ProcedimentoCid) => r.cid.co_cid),
        textCol("no_cid", "Descrição", (r: ProcedimentoCid) => r.cid.no_cid),
        {
          id: "st_principal",
          header: "Tipo",
          cell: ({ row }) => (
            <TpBadge code={!!(row.original as ProcedimentoCid).st_principal} map={ST_PRINCIPAL} />
          ),
          meta: {
            csvHeader: "Tipo",
            csvValue: (r) =>
              (r as ProcedimentoCid).st_principal ? "Principal" : "Secundário",
          },
        },
        {
          id: "tp_sexo",
          header: "Sexo",
          cell: ({ row }) => (
            <TpBadge code={(row.original as ProcedimentoCid).cid.tp_sexo} map={TP_SEXO} />
          ),
          meta: { csvHeader: "Sexo", csvValue: (r) => (r as ProcedimentoCid).cid.tp_sexo ?? "" },
        },
      ],
    },
    reverso: {
      kind: "cids",
      resource: "rel-cid",
      fetchOpcoes: (search, page) =>
        getCids({ search: search || undefined, page, page_size: 20 }),
      getValue: (c) => c.co_cid,
      getLabel: (c) => `${c.co_cid} — ${c.no_cid ?? ""}`.trim(),
    },
  },

  // 3 ─ Procedimento × Instrumento de Registro ⭐ (reverso na Fase 3)
  {
    slug: "procedimento-registro",
    titulo: "Procedimento × Instrumento de Registro",
    entidadeLabel: "Instrumento",
    entidadeLabelSingular: "Instrumento de Registro",
    descricao: "Instrumento de cobrança (BPA/AIH/APAC…) de cada procedimento.",
    icon: ClipboardList,
    atalhoHome: true,
    direto: {
      id: "registros",
      rel: "registros",
      getRowKey: (r: ProcedimentoRegistro) => r.registro.co_registro,
      colunas: [
        codeCol("co_registro", "Instrumento", (r: ProcedimentoRegistro) => r.registro.co_registro),
        textCol("no_registro", "Nome", (r: ProcedimentoRegistro) => r.registro.no_registro),
      ],
    },
  },

  // 4 ─ Procedimento × Serviço/Classificação (bidirecional)
  {
    slug: "procedimento-servico",
    titulo: "Procedimento × Serviço/Classificação",
    entidadeLabel: "Serviço",
    entidadeLabelSingular: "Serviço",
    descricao: "Serviços e classificações vinculados a cada procedimento (APAC).",
    icon: ConciergeBell,
    direto: {
      id: "servicos",
      rel: "servicos",
      getRowKey: (r: ProcedimentoServico) =>
        `${r.servico_classificacao.co_servico}-${r.servico_classificacao.co_classificacao}`,
      colunas: [
        codeCol("co_servico", "Serviço", (r: ProcedimentoServico) => r.servico_classificacao.co_servico),
        monoCol("co_classificacao", "Classificação", (r: ProcedimentoServico) => r.servico_classificacao.co_classificacao),
        textCol("no_classificacao", "Nome", (r: ProcedimentoServico) => r.servico_classificacao.no_classificacao),
      ],
    },
    reverso: {
      kind: "servicos",
      resource: "rel-servico",
      fetchOpcoes: (search, page) =>
        getServicos({ search: search || undefined, page, page_size: 20 }),
      getValue: (s) => s.co_servico,
      getLabel: (s) => `${s.co_servico} — ${s.no_servico ?? ""}`.trim(),
    },
  },

  // 5 ─ Procedimento × Habilitação (com Incremento) (bidirecional)
  {
    slug: "procedimento-habilitacao",
    titulo: "Procedimento × Habilitação",
    entidadeLabel: "Habilitação",
    entidadeLabelSingular: "Habilitação",
    descricao: "Habilitações exigidas do estabelecimento e percentuais de incremento.",
    icon: BadgeCheck,
    direto: {
      id: "habilitacoes",
      rel: "habilitacoes",
      getRowKey: (r: ProcedimentoHabilitacao) =>
        `${r.habilitacao.co_habilitacao}-${r.nu_grupo_habilitacao ?? ""}`,
      colunas: [
        codeCol("co_habilitacao", "Habilitação", (r: ProcedimentoHabilitacao) => r.habilitacao.co_habilitacao),
        textCol("no_habilitacao", "Nome", (r: ProcedimentoHabilitacao) => r.habilitacao.no_habilitacao),
        monoCol("nu_grupo_habilitacao", "Grupo Hab.", (r: ProcedimentoHabilitacao) => r.nu_grupo_habilitacao),
        textCol("no_grupo_habilitacao", "Nome do grupo", (r: ProcedimentoHabilitacao) => r.grupo_habilitacao?.no_grupo_habilitacao),
      ],
    },
    diretoAlt: {
      id: "incrementos",
      label: "Incrementos",
      baseLabel: "Habilitações",
      rel: "incrementos",
      getRowKey: (r: ProcedimentoIncremento) => r.habilitacao.co_habilitacao,
      colunas: [
        codeCol("co_habilitacao", "Habilitação", (r: ProcedimentoIncremento) => r.habilitacao.co_habilitacao),
        textCol("no_habilitacao", "Nome", (r: ProcedimentoIncremento) => r.habilitacao.no_habilitacao),
        pctCol("vl_percentual_sh", "% SH", (r: ProcedimentoIncremento) => r.vl_percentual_sh),
        pctCol("vl_percentual_sa", "% SA", (r: ProcedimentoIncremento) => r.vl_percentual_sa),
        pctCol("vl_percentual_sp", "% SP", (r: ProcedimentoIncremento) => r.vl_percentual_sp),
      ],
    },
    reverso: {
      kind: "habilitacoes",
      resource: "rel-habilitacao",
      fetchOpcoes: (search, page) =>
        getHabilitacoes({ search: search || undefined, page, page_size: 20 }),
      getValue: (h) => h.co_habilitacao,
      getLabel: (h) => `${h.co_habilitacao} — ${h.no_habilitacao ?? ""}`.trim(),
    },
  },

  // 6 ─ Procedimento × Regras Condicionadas (reverso na Fase 3)
  {
    slug: "procedimento-regras-condicionadas",
    titulo: "Procedimento × Regras Condicionadas",
    entidadeLabel: "Regra",
    entidadeLabelSingular: "Regra Condicionada",
    descricao: "Regras condicionadas de cobrança aplicáveis a cada procedimento.",
    icon: GitBranch,
    direto: {
      id: "regras-condicionadas",
      rel: "regras-condicionadas",
      getRowKey: (r: ProcedimentoRegraCond) => r.regra_condicionada.co_regra_condicionada,
      colunas: [
        codeCol("co_regra_condicionada", "Código", (r: ProcedimentoRegraCond) => r.regra_condicionada.co_regra_condicionada),
        textCol("no_regra_condicionada", "Nome", (r: ProcedimentoRegraCond) => r.regra_condicionada.no_regra_condicionada),
        {
          id: "ds_regra_condicionada",
          header: "Descrição",
          cell: ({ row }) => {
            const ds = (row.original as ProcedimentoRegraCond).regra_condicionada.ds_regra_condicionada;
            return ds ? <span title={ds}>{truncate(ds, 60)}</span> : "—";
          },
          meta: {
            csvHeader: "Descrição",
            csvValue: (r) => (r as ProcedimentoRegraCond).regra_condicionada.ds_regra_condicionada ?? "",
          },
        },
      ],
    },
  },

  // 7 ─ Procedimento × SIA/SIH (reverso na Fase 3)
  {
    slug: "procedimento-sia-sih",
    titulo: "Procedimento × SIA/SIH",
    entidadeLabel: "SIA/SIH",
    entidadeLabelSingular: "Procedimento SIA/SIH",
    descricao: "Correspondência entre procedimentos SIGTAP e SIA/SIH (A/H).",
    icon: FileSpreadsheet,
    direto: {
      id: "sia-sih",
      rel: "sia-sih",
      getRowKey: (r: ProcedimentoSiaSih) => r.sia_sih.co_procedimento_sia_sih,
      colunas: [
        codeCol("co_procedimento_sia_sih", "Código SIA/SIH", (r: ProcedimentoSiaSih) => r.sia_sih.co_procedimento_sia_sih),
        textCol("no_procedimento_sia_sih", "Nome", (r: ProcedimentoSiaSih) => r.sia_sih.no_procedimento_sia_sih),
        {
          id: "tp_procedimento",
          header: "Tipo",
          cell: ({ row }) => {
            const r = row.original as ProcedimentoSiaSih;
            return <TpBadge code={r.tp_procedimento ?? r.sia_sih.tp_procedimento} map={TP_PROCEDIMENTO_SIA_SIH} />;
          },
          meta: {
            csvHeader: "Tipo",
            csvValue: (r) => {
              const s = r as ProcedimentoSiaSih;
              return s.tp_procedimento ?? s.sia_sih.tp_procedimento ?? "";
            },
          },
        },
      ],
    },
  },

  // 8 ─ Procedimento × TUSS (reverso na Fase 3)
  {
    slug: "procedimento-tuss",
    titulo: "Procedimento × TUSS",
    entidadeLabel: "TUSS",
    entidadeLabelSingular: "Correlação TUSS",
    descricao: "Correlação dos procedimentos com a terminologia TUSS (TISS/ANS).",
    icon: Hash,
    direto: {
      id: "tuss",
      rel: "tuss",
      getRowKey: (r: ProcedimentoTuss) => r.tuss.co_tuss,
      colunas: [
        codeCol("co_tuss", "TUSS", (r: ProcedimentoTuss) => r.tuss.co_tuss),
        textCol("no_tuss", "Nome", (r: ProcedimentoTuss) => r.tuss.no_tuss),
      ],
    },
  },
];

export const RELATORIO_BY_SLUG: Record<string, RelatorioConfig> = Object.fromEntries(
  RELATORIOS.map((r) => [r.slug, r])
);

export function getRelatorio(slug: string | undefined): RelatorioConfig | undefined {
  return slug ? RELATORIO_BY_SLUG[slug] : undefined;
}
