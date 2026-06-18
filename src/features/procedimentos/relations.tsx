/**
 * Configuração das 16 abas de relação do procedimento (PRD §11.2).
 * Cada aba é uma DataTable enxuta do schema correspondente (§5.1); itens com
 * chave navegável abrem o dicionário em Dialog (RecordLink). Itens que apontam
 * para outro procedimento navegam para a página (CodeLink), conforme a regra
 * de "detalhe de procedimento é sempre página".
 */
import type { ColumnDef } from "@tanstack/react-table";
import type { ProcRelationKey } from "@/api/queries";
import type {
  ProcedimentoCid,
  ProcedimentoCompRede,
  ProcedimentoCompativel,
  ProcedimentoDetalhe,
  ProcedimentoHabilitacao,
  ProcedimentoIncremento,
  ProcedimentoLeito,
  ProcedimentoModalidade,
  ProcedimentoOcupacao,
  ProcedimentoOrigem,
  ProcedimentoRegistro,
  ProcedimentoRegraCond,
  ProcedimentoRenases,
  ProcedimentoServico,
  ProcedimentoSiaSih,
  ProcedimentoTuss,
} from "@/api/types";
import { CodeLink } from "@/components/common/CodeLink";
import { PercentCell } from "@/components/common/cells";
import { TpBadge } from "@/components/common/TpBadge";
import { RecordLink } from "@/features/records/RecordLink";
import { formatInt, truncate } from "@/lib/format";
import {
  ST_PRINCIPAL,
  TP_AGRAVO,
  TP_COMPATIBILIDADE,
  TP_PROCEDIMENTO_SIA_SIH,
  TP_SEXO,
} from "@/lib/labels";

export interface RelationTabDef {
  key: ProcRelationKey;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<any>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getRowKey: (row: any) => string;
}

const nameCell = (text: string | undefined) => (
  <span title={text} className="block max-w-[20rem]">
    {text ?? "—"}
  </span>
);

export const RELATION_TABS: RelationTabDef[] = [
  {
    key: "cids",
    label: "CIDs",
    getRowKey: (r: ProcedimentoCid) => r.cid.co_cid,
    columns: [
      {
        id: "co_cid",
        header: "CID",
        cell: ({ row }) => (
          <RecordLink resource="cids" co={(row.original as ProcedimentoCid).cid.co_cid} />
        ),
      },
      {
        id: "no_cid",
        header: "Nome",
        cell: ({ row }) => nameCell((row.original as ProcedimentoCid).cid.no_cid),
      },
      {
        id: "tp_sexo",
        header: "Sexo",
        cell: ({ row }) => <TpBadge code={(row.original as ProcedimentoCid).cid.tp_sexo} map={TP_SEXO} />,
      },
      {
        id: "tp_agravo",
        header: "Agravo",
        cell: ({ row }) => <TpBadge code={(row.original as ProcedimentoCid).cid.tp_agravo} map={TP_AGRAVO} />,
      },
      {
        id: "st_principal",
        header: "Principal",
        cell: ({ row }) => <TpBadge code={!!(row.original as ProcedimentoCid).st_principal} map={ST_PRINCIPAL} />,
      },
    ],
  },
  {
    key: "ocupacoes",
    label: "Ocupações (CBO)",
    getRowKey: (r: ProcedimentoOcupacao) => r.ocupacao.co_ocupacao,
    columns: [
      {
        id: "co_ocupacao",
        header: "CBO",
        cell: ({ row }) => (
          <RecordLink resource="ocupacoes" co={(row.original as ProcedimentoOcupacao).ocupacao.co_ocupacao} />
        ),
      },
      {
        id: "no_ocupacao",
        header: "Nome",
        cell: ({ row }) => nameCell((row.original as ProcedimentoOcupacao).ocupacao.no_ocupacao),
      },
    ],
  },
  {
    key: "modalidades",
    label: "Modalidades",
    getRowKey: (r: ProcedimentoModalidade) => r.modalidade.co_modalidade,
    columns: [
      {
        id: "co_modalidade",
        header: "Código",
        cell: ({ row }) => (
          <RecordLink resource="modalidades" co={(row.original as ProcedimentoModalidade).modalidade.co_modalidade} />
        ),
      },
      {
        id: "no_modalidade",
        header: "Nome",
        cell: ({ row }) => nameCell((row.original as ProcedimentoModalidade).modalidade.no_modalidade),
      },
    ],
  },
  {
    key: "servicos",
    label: "Serviços / Classificações",
    getRowKey: (r: ProcedimentoServico) =>
      `${r.servico_classificacao.co_servico}-${r.servico_classificacao.co_classificacao}`,
    columns: [
      {
        id: "co_servico",
        header: "Serviço",
        cell: ({ row }) => (
          <RecordLink resource="servicos" co={(row.original as ProcedimentoServico).servico_classificacao.co_servico} />
        ),
      },
      {
        id: "co_classificacao",
        header: "Classificação",
        cell: ({ row }) => (
          <span className="font-mono text-[0.8125rem] tabular-nums">
            {(row.original as ProcedimentoServico).servico_classificacao.co_classificacao}
          </span>
        ),
      },
      {
        id: "no_classificacao",
        header: "Nome",
        cell: ({ row }) => nameCell((row.original as ProcedimentoServico).servico_classificacao.no_classificacao),
      },
    ],
  },
  {
    key: "habilitacoes",
    label: "Habilitações",
    getRowKey: (r: ProcedimentoHabilitacao) =>
      `${r.habilitacao.co_habilitacao}-${r.nu_grupo_habilitacao ?? ""}`,
    columns: [
      {
        id: "co_habilitacao",
        header: "Habilitação",
        cell: ({ row }) => (
          <RecordLink resource="habilitacoes" co={(row.original as ProcedimentoHabilitacao).habilitacao.co_habilitacao} />
        ),
      },
      {
        id: "no_habilitacao",
        header: "Nome",
        cell: ({ row }) => nameCell((row.original as ProcedimentoHabilitacao).habilitacao.no_habilitacao),
      },
      {
        id: "nu_grupo_habilitacao",
        header: "Grupo",
        cell: ({ row }) => {
          const r = row.original as ProcedimentoHabilitacao;
          return r.nu_grupo_habilitacao ? (
            <RecordLink resource="grupos-habilitacao" co={r.nu_grupo_habilitacao} />
          ) : (
            "—"
          );
        },
      },
      {
        id: "no_grupo_habilitacao",
        header: "Nome do grupo",
        cell: ({ row }) => nameCell((row.original as ProcedimentoHabilitacao).grupo_habilitacao?.no_grupo_habilitacao),
      },
    ],
  },
  {
    key: "incrementos",
    label: "Incrementos",
    getRowKey: (r: ProcedimentoIncremento) => r.habilitacao.co_habilitacao,
    columns: [
      {
        id: "co_habilitacao",
        header: "Habilitação",
        cell: ({ row }) => (
          <RecordLink resource="habilitacoes" co={(row.original as ProcedimentoIncremento).habilitacao.co_habilitacao} />
        ),
      },
      {
        id: "no_habilitacao",
        header: "Nome",
        cell: ({ row }) => nameCell((row.original as ProcedimentoIncremento).habilitacao.no_habilitacao),
      },
      {
        id: "vl_percentual_sh",
        header: "% SH",
        cell: ({ row }) => <PercentCell value={(row.original as ProcedimentoIncremento).vl_percentual_sh} />,
        meta: { align: "right" },
      },
      {
        id: "vl_percentual_sa",
        header: "% SA",
        cell: ({ row }) => <PercentCell value={(row.original as ProcedimentoIncremento).vl_percentual_sa} />,
        meta: { align: "right" },
      },
      {
        id: "vl_percentual_sp",
        header: "% SP",
        cell: ({ row }) => <PercentCell value={(row.original as ProcedimentoIncremento).vl_percentual_sp} />,
        meta: { align: "right" },
      },
    ],
  },
  {
    key: "compativeis",
    label: "Compatíveis",
    getRowKey: (r: ProcedimentoCompativel) =>
      `${r.procedimento_compativel.co_procedimento}-${r.registro_principal}-${r.registro_compativel}`,
    columns: [
      {
        id: "co_procedimento",
        header: "Código",
        cell: ({ row }) => (
          <CodeLink
            to={`/procedimentos/${(row.original as ProcedimentoCompativel).procedimento_compativel.co_procedimento}`}
            code={(row.original as ProcedimentoCompativel).procedimento_compativel.co_procedimento}
          />
        ),
      },
      {
        id: "no_procedimento",
        header: "Procedimento",
        cell: ({ row }) => nameCell((row.original as ProcedimentoCompativel).procedimento_compativel.no_procedimento),
      },
      {
        id: "registro_principal",
        header: "Reg. princ.",
        cell: ({ row }) => (row.original as ProcedimentoCompativel).registro_principal,
      },
      {
        id: "registro_compativel",
        header: "Reg. compat.",
        cell: ({ row }) => (row.original as ProcedimentoCompativel).registro_compativel,
      },
      {
        id: "tp_compatibilidade",
        header: "Tipo",
        cell: ({ row }) => <TpBadge code={(row.original as ProcedimentoCompativel).tp_compatibilidade} map={TP_COMPATIBILIDADE} />,
      },
      {
        id: "qt_permitida",
        header: "Qtd.",
        cell: ({ row }) => formatInt((row.original as ProcedimentoCompativel).qt_permitida),
        meta: { align: "right" },
      },
    ],
  },
  {
    key: "leitos",
    label: "Leitos",
    getRowKey: (r: ProcedimentoLeito) => r.tipo_leito.co_tipo_leito,
    columns: [
      {
        id: "co_tipo_leito",
        header: "Código",
        cell: ({ row }) => (
          <RecordLink resource="tipos-leito" co={(row.original as ProcedimentoLeito).tipo_leito.co_tipo_leito} />
        ),
      },
      {
        id: "no_tipo_leito",
        header: "Nome",
        cell: ({ row }) => nameCell((row.original as ProcedimentoLeito).tipo_leito.no_tipo_leito),
      },
    ],
  },
  {
    key: "registros",
    label: "Registros",
    getRowKey: (r: ProcedimentoRegistro) => r.registro.co_registro,
    columns: [
      {
        id: "co_registro",
        header: "Código",
        cell: ({ row }) => (
          <RecordLink resource="registros" co={(row.original as ProcedimentoRegistro).registro.co_registro} />
        ),
      },
      {
        id: "no_registro",
        header: "Nome",
        cell: ({ row }) => nameCell((row.original as ProcedimentoRegistro).registro.no_registro),
      },
    ],
  },
  {
    key: "detalhes",
    label: "Detalhes",
    getRowKey: (r: ProcedimentoDetalhe) => r.detalhe.co_detalhe,
    columns: [
      {
        id: "co_detalhe",
        header: "Código",
        cell: ({ row }) => (
          <RecordLink resource="detalhes" co={(row.original as ProcedimentoDetalhe).detalhe.co_detalhe} />
        ),
      },
      {
        id: "no_detalhe",
        header: "Nome",
        cell: ({ row }) => nameCell((row.original as ProcedimentoDetalhe).detalhe.no_detalhe),
      },
    ],
  },
  {
    key: "sia-sih",
    label: "SIA/SIH",
    getRowKey: (r: ProcedimentoSiaSih) => r.sia_sih.co_procedimento_sia_sih,
    columns: [
      {
        id: "co_procedimento_sia_sih",
        header: "Código",
        cell: ({ row }) => (
          <span className="font-mono text-[0.8125rem] tabular-nums">
            {(row.original as ProcedimentoSiaSih).sia_sih.co_procedimento_sia_sih}
          </span>
        ),
      },
      {
        id: "no_procedimento_sia_sih",
        header: "Nome",
        cell: ({ row }) => nameCell((row.original as ProcedimentoSiaSih).sia_sih.no_procedimento_sia_sih),
      },
      {
        id: "tp_procedimento",
        header: "Tipo",
        cell: ({ row }) => {
          const r = row.original as ProcedimentoSiaSih;
          return <TpBadge code={r.tp_procedimento ?? r.sia_sih.tp_procedimento} map={TP_PROCEDIMENTO_SIA_SIH} />;
        },
      },
    ],
  },
  {
    key: "origem",
    label: "Origem",
    getRowKey: (r: ProcedimentoOrigem) => r.procedimento_origem.co_procedimento,
    columns: [
      {
        id: "co_procedimento",
        header: "Código",
        cell: ({ row }) => (
          <CodeLink
            to={`/procedimentos/${(row.original as ProcedimentoOrigem).procedimento_origem.co_procedimento}`}
            code={(row.original as ProcedimentoOrigem).procedimento_origem.co_procedimento}
          />
        ),
      },
      {
        id: "no_procedimento",
        header: "Procedimento",
        cell: ({ row }) => nameCell((row.original as ProcedimentoOrigem).procedimento_origem.no_procedimento),
      },
    ],
  },
  {
    key: "regras-condicionadas",
    label: "Regras Condicionadas",
    getRowKey: (r: ProcedimentoRegraCond) => r.regra_condicionada.co_regra_condicionada,
    columns: [
      {
        id: "co_regra_condicionada",
        header: "Código",
        cell: ({ row }) => (
          <RecordLink resource="regras-condicionadas" co={(row.original as ProcedimentoRegraCond).regra_condicionada.co_regra_condicionada} />
        ),
      },
      {
        id: "no_regra_condicionada",
        header: "Nome",
        cell: ({ row }) => nameCell((row.original as ProcedimentoRegraCond).regra_condicionada.no_regra_condicionada),
      },
      {
        id: "ds_regra_condicionada",
        header: "Descrição",
        cell: ({ row }) => {
          const ds = (row.original as ProcedimentoRegraCond).regra_condicionada.ds_regra_condicionada;
          return ds ? <span title={ds}>{truncate(ds, 60)}</span> : "—";
        },
      },
    ],
  },
  {
    key: "renases",
    label: "RENASES",
    getRowKey: (r: ProcedimentoRenases) => r.renases.co_renases,
    columns: [
      {
        id: "co_renases",
        header: "Código",
        cell: ({ row }) => (
          <RecordLink resource="renases" co={(row.original as ProcedimentoRenases).renases.co_renases} />
        ),
      },
      {
        id: "no_renases",
        header: "Nome",
        cell: ({ row }) => nameCell((row.original as ProcedimentoRenases).renases.no_renases),
      },
    ],
  },
  {
    key: "redes",
    label: "Redes / Componentes",
    getRowKey: (r: ProcedimentoCompRede) => r.componente_rede.co_componente_rede,
    columns: [
      {
        id: "co_componente_rede",
        header: "Componente",
        cell: ({ row }) => (
          <RecordLink resource="componentes-rede" co={(row.original as ProcedimentoCompRede).componente_rede.co_componente_rede} />
        ),
      },
      {
        id: "no_componente_rede",
        header: "Nome",
        cell: ({ row }) => nameCell((row.original as ProcedimentoCompRede).componente_rede.no_componente_rede),
      },
      {
        id: "co_rede_atencao",
        header: "Rede",
        cell: ({ row }) => {
          const r = row.original as ProcedimentoCompRede;
          return r.componente_rede.co_rede_atencao ? (
            <RecordLink resource="redes-atencao" co={r.componente_rede.co_rede_atencao} />
          ) : (
            "—"
          );
        },
      },
    ],
  },
  {
    key: "tuss",
    label: "TUSS",
    getRowKey: (r: ProcedimentoTuss) => r.tuss.co_tuss,
    columns: [
      {
        id: "co_tuss",
        header: "Código",
        cell: ({ row }) => (
          <RecordLink resource="tuss" co={(row.original as ProcedimentoTuss).tuss.co_tuss} />
        ),
      },
      {
        id: "no_tuss",
        header: "Nome",
        cell: ({ row }) => nameCell((row.original as ProcedimentoTuss).tuss.no_tuss),
      },
    ],
  },
];

export const RELATION_TABS_BY_KEY: Record<string, RelationTabDef> =
  Object.fromEntries(RELATION_TABS.map((t) => [t.key, t]));
