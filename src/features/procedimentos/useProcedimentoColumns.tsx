import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useDictionaryList } from "@/api/queries";
import type { Financiamento, ProcedimentoList } from "@/api/types";
import { CopyCode } from "@/components/common/CopyCode";
import { MoneyCell } from "@/components/common/cells";
import { TpBadge } from "@/components/common/TpBadge";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { TP_COMPLEXIDADE, TP_SEXO } from "@/lib/labels";

/** Mapa código→nome de financiamentos para enriquecer a coluna "Financ.". */
function useFinanciamentoMap() {
  const { data } = useDictionaryList<Financiamento>(
    "financiamentos",
    "/financiamentos",
    { page_size: 200, ordering: "co_financiamento" },
    true
  );
  return useMemo(() => {
    const m = new Map<string, string>();
    for (const f of data?.results ?? []) {
      if (f.no_financiamento) m.set(f.co_financiamento, f.no_financiamento);
    }
    return m;
  }, [data]);
}

/**
 * Colunas da tabela de procedimentos (PRD §11.1). Reutilizadas pela lista
 * principal e pelas consultas reversas.
 */
export function useProcedimentoColumns(): ColumnDef<ProcedimentoList>[] {
  const financiamentoMap = useFinanciamentoMap();

  return useMemo<ColumnDef<ProcedimentoList>[]>(
    () => [
      {
        id: "co_procedimento",
        accessorKey: "co_procedimento",
        header: "Código",
        enableHiding: false,
        cell: ({ row }) => <CopyCode value={row.original.co_procedimento} />,
        meta: {
          orderingField: "co_procedimento",
          csvHeader: "Código",
          csvValue: (r) => r.co_procedimento,
        },
      },
      {
        id: "no_procedimento",
        accessorKey: "no_procedimento",
        header: "Procedimento",
        cell: ({ row }) => (
          <SimpleTooltip content={row.original.no_procedimento}>
            <span className="block max-w-[16rem] sm:max-w-[28rem]">
              {row.original.no_procedimento}
            </span>
          </SimpleTooltip>
        ),
        meta: {
          orderingField: "no_procedimento",
          csvHeader: "Procedimento",
          csvValue: (r) => r.no_procedimento ?? "",
        },
      },
      {
        id: "tp_complexidade",
        accessorKey: "tp_complexidade",
        header: "Compl.",
        cell: ({ row }) => (
          <TpBadge code={row.original.tp_complexidade} map={TP_COMPLEXIDADE} />
        ),
        meta: {
          csvHeader: "Complexidade",
          csvValue: (r) => r.tp_complexidade ?? "",
        },
      },
      {
        id: "tp_sexo",
        accessorKey: "tp_sexo",
        header: "Sexo",
        cell: ({ row }) => <TpBadge code={row.original.tp_sexo} map={TP_SEXO} />,
        meta: { csvHeader: "Sexo", csvValue: (r) => r.tp_sexo ?? "" },
      },
      {
        id: "financiamento",
        accessorKey: "financiamento",
        header: "Financ.",
        cell: ({ row }) => {
          const code = row.original.financiamento;
          const nome = financiamentoMap.get(code);
          return (
            <SimpleTooltip content={nome}>
              <span className="font-mono text-[0.8125rem] tabular-nums">
                {code}
              </span>
            </SimpleTooltip>
          );
        },
        meta: {
          csvHeader: "Financiamento",
          csvValue: (r) => r.financiamento,
        },
      },
      {
        id: "vl_sh",
        accessorKey: "vl_sh",
        header: "SH",
        cell: ({ row }) => <MoneyCell value={row.original.vl_sh} />,
        meta: {
          align: "right",
          orderingField: "vl_sh",
          csvHeader: "Valor SH",
          csvValue: (r) => r.vl_sh ?? "",
        },
      },
      {
        id: "vl_sa",
        accessorKey: "vl_sa",
        header: "SA",
        cell: ({ row }) => <MoneyCell value={row.original.vl_sa} />,
        meta: {
          align: "right",
          orderingField: "vl_sa",
          csvHeader: "Valor SA",
          csvValue: (r) => r.vl_sa ?? "",
        },
      },
      {
        id: "vl_sp",
        accessorKey: "vl_sp",
        header: "SP",
        cell: ({ row }) => <MoneyCell value={row.original.vl_sp} />,
        meta: {
          align: "right",
          orderingField: "vl_sp",
          csvHeader: "Valor SP",
          csvValue: (r) => r.vl_sp ?? "",
        },
      },
    ],
    [financiamentoMap]
  );
}
