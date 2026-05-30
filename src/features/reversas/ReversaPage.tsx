import { useParams } from "react-router-dom";
import {
  useDictionaryDetail,
  useProcedimentosReversa,
  type ReversaKind,
} from "@/api/queries";
import { useListUrlState } from "@/hooks/useListUrlState";
import { PageHeader } from "@/components/common/PageHeader";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { SearchInput } from "@/components/filters/SearchInput";
import { DataTable } from "@/components/data-table/DataTable";
import { EmptyState } from "@/components/common/states";
import { CopyCode } from "@/components/common/CopyCode";
import { formatCompetencia, formatInt } from "@/lib/format";
import { useProcedimentoColumns } from "@/features/procedimentos/useProcedimentoColumns";
import { getDictionary } from "@/features/dicionarios/registry";

type Row = Record<string, unknown>;

export function ReversaPage({ kind }: { kind: ReversaKind }) {
  const params = useParams();
  const co = params.co;
  const config = getDictionary(kind)!;

  const { page, pageSize, ordering, search, setPage, setPageSize, setOrdering, setSearch } =
    useListUrlState({ defaultOrdering: "co_procedimento" });

  const entityQuery = useDictionaryDetail<Row>(
    config.key,
    config.basePath,
    co,
    config.versioned
  );

  const listQuery = useProcedimentosReversa(kind, co, {
    search: search || undefined,
    ordering,
    page,
    page_size: pageSize,
  });

  const columns = useProcedimentoColumns();

  const nameField = config.columns.find((c) => c.kind !== "code")?.field;
  const entityName = nameField
    ? (entityQuery.data?.[nameField] as string | undefined)
    : undefined;

  const count = listQuery.data?.count;
  const competencia = listQuery.data?.competencia;

  return (
    <div className="space-y-5">
      <Breadcrumbs
        items={[
          { label: "Início", to: "/" },
          { label: config.label, to: `/${config.key}` },
          { label: co ?? "", to: `/${config.key}/${encodeURIComponent(co ?? "")}` },
          { label: "Procedimentos" },
        ]}
      />

      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            Procedimentos de
            <CopyCode value={co ?? ""} className="text-base font-normal" />
            {entityName && (
              <span className="text-muted-foreground">{entityName}</span>
            )}
          </span>
        }
        description={`${config.labelSingular} → procedimentos relacionados`}
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

      <SearchInput
        value={search}
        onDebouncedChange={setSearch}
        placeholder="Buscar nos procedimentos relacionados…"
        className="sm:max-w-md"
      />

      <DataTable
        columns={columns}
        data={listQuery.data?.results}
        count={count}
        getRowKey={(row) => row.co_procedimento}
        page={page}
        pageSize={pageSize}
        ordering={ordering}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onOrderingChange={setOrdering}
        isLoading={listQuery.isLoading}
        isFetching={listQuery.isFetching}
        error={listQuery.error}
        onRetry={() => listQuery.refetch()}
        rowHref={(row) => `/procedimentos/${encodeURIComponent(row.co_procedimento)}`}
        caption={`Procedimentos relacionados a ${config.labelSingular} ${co}`}
        csvFilename={`procedimentos-${config.key}-${co}.csv`}
        emptyState={
          <EmptyState
            title="Sem procedimentos"
            description={`Nenhum procedimento relacionado a este ${config.labelSingular.toLowerCase()} nesta competência.`}
          />
        }
      />
    </div>
  );
}
