import { useMemo } from "react";
import { useProcedimentos } from "@/api/queries";
import { useListUrlState } from "@/hooks/useListUrlState";
import { readProcedimentoFiltros } from "@/lib/url";
import { PageHeader } from "@/components/common/PageHeader";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { FilterChips, type ActiveFilter } from "@/components/filters/FilterChips";
import { DataTable } from "@/components/data-table/DataTable";
import { EmptyState } from "@/components/common/states";
import { formatCompetencia, formatInt } from "@/lib/format";
import { resolveLabel, TP_COMPLEXIDADE, TP_SEXO } from "@/lib/labels";
import type { ProcedimentoFiltros } from "@/api/types";
import { useProcedimentoColumns } from "./useProcedimentoColumns";
import { ProcedimentoFilters } from "./ProcedimentoFilters";

export function ProcedimentosListPage() {
  const {
    searchParams,
    page,
    pageSize,
    ordering,
    search,
    setPage,
    setPageSize,
    setOrdering,
    setSearch,
    setFilters,
  } = useListUrlState({ defaultOrdering: "co_procedimento" });

  const filtros = useMemo<ProcedimentoFiltros>(
    () => readProcedimentoFiltros(searchParams),
    [searchParams]
  );

  const query = useProcedimentos(filtros);
  const columns = useProcedimentoColumns();

  const count = query.data?.count;
  const competencia = query.data?.competencia;

  // Filtros avançados ativos (exclui search/page/ordering).
  const advancedKeys = [
    "grupo",
    "sub_grupo",
    "forma_organizacao",
    "financiamento",
    "modalidade",
    "complexidade",
    "sexo",
  ] as const;
  const activeAdvancedCount = advancedKeys.filter((k) => filtros[k]).length;

  const chips: ActiveFilter[] = [];
  if (search)
    chips.push({ key: "search", label: "Busca", value: search, onRemove: () => setSearch("") });
  const chipDefs: { key: (typeof advancedKeys)[number]; label: string; format?: (v: string) => string }[] = [
    { key: "grupo", label: "Grupo" },
    { key: "sub_grupo", label: "Subgrupo" },
    { key: "forma_organizacao", label: "Forma" },
    { key: "financiamento", label: "Financ." },
    { key: "modalidade", label: "Modalidade" },
    {
      key: "complexidade",
      label: "Complexidade",
      format: (v) => resolveLabel(TP_COMPLEXIDADE, v)?.label ?? v,
    },
    { key: "sexo", label: "Sexo", format: (v) => resolveLabel(TP_SEXO, v)?.label ?? v },
  ];
  for (const def of chipDefs) {
    const v = filtros[def.key];
    if (v)
      chips.push({
        key: def.key,
        label: def.label,
        value: def.format ? def.format(v) : v,
        onRemove: () => setFilters({ [def.key]: undefined }),
      });
  }

  return (
    <div className="space-y-5">
      <Breadcrumbs items={[{ label: "Início", to: "/" }, { label: "Procedimentos" }]} />

      <PageHeader
        title="Procedimentos"
        meta={
          count != null ? (
            <>
              {formatInt(count)} {count === 1 ? "procedimento" : "procedimentos"}
              {competencia && <> · competência {formatCompetencia(competencia)}</>}
            </>
          ) : (
            "Carregando…"
          )
        }
      />

      <ProcedimentoFilters
        filtros={filtros}
        search={search}
        onSearch={setSearch}
        onChange={(patch) => setFilters(patch as Record<string, string | undefined>)}
        activeAdvancedCount={activeAdvancedCount}
      />

      <FilterChips
        filters={chips}
        onClearAll={() =>
          setFilters({
            search: undefined,
            grupo: undefined,
            sub_grupo: undefined,
            forma_organizacao: undefined,
            financiamento: undefined,
            modalidade: undefined,
            complexidade: undefined,
            sexo: undefined,
          })
        }
      />

      <DataTable
        columns={columns}
        data={query.data?.results}
        count={count}
        getRowKey={(row) => row.co_procedimento}
        page={page}
        pageSize={pageSize}
        ordering={ordering}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onOrderingChange={setOrdering}
        isLoading={query.isLoading}
        isFetching={query.isFetching}
        error={query.error}
        onRetry={() => query.refetch()}
        rowHref={(row) => `/procedimentos/${encodeURIComponent(row.co_procedimento)}`}
        caption="Lista de procedimentos"
        csvFilename="procedimentos.csv"
        emptyState={
          <EmptyState
            title="Nenhum procedimento"
            description={
              chips.length
                ? "Ajuste a busca ou os filtros para encontrar procedimentos."
                : "Não há procedimentos para exibir nesta competência."
            }
          />
        }
      />
    </div>
  );
}
