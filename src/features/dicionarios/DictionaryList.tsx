import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Activity } from "lucide-react";
import { useDictionaryList } from "@/api/queries";
import { useListUrlState } from "@/hooks/useListUrlState";
import { PageHeader } from "@/components/common/PageHeader";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { SearchInput } from "@/components/filters/SearchInput";
import { FilterChips, type ActiveFilter } from "@/components/filters/FilterChips";
import { Segmented } from "@/components/filters/Segmented";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/DataTable";
import { EmptyState } from "@/components/common/states";
import { formatCompetencia, formatInt } from "@/lib/format";
import { readParam } from "@/lib/url";
import { ReversaDialog } from "@/features/reversas/ReversaDialog";
import { renderDicValue } from "./render";
import { DictionaryDetailDialog } from "./DictionaryDetailDialog";
import { DictionaryFilters } from "./DictionaryFilters";
import type { DictionaryConfig } from "./registry";

type Row = Record<string, unknown>;

interface ReversaTarget {
  co: string;
  name?: string;
}

export function DictionaryList({ config }: { config: DictionaryConfig }) {
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
  } = useListUrlState({ defaultOrdering: config.defaultOrdering });

  // Filtros (compostos como co_grupo + o toggle da toolbar) lidos da URL.
  const filterValues = useMemo(() => {
    const out: Record<string, string | undefined> = {};
    for (const f of config.filters ?? []) {
      out[f.param] = readParam(searchParams, f.param);
    }
    if (config.toolbarFilter) {
      out[config.toolbarFilter.param] = readParam(
        searchParams,
        config.toolbarFilter.param
      );
    }
    return out;
  }, [config.filters, config.toolbarFilter, searchParams]);

  const query = useDictionaryList<Row>(
    config.key,
    config.basePath,
    {
      search: search || undefined,
      ordering,
      page,
      page_size: pageSize,
      ...filterValues,
    },
    config.versioned
  );

  // Detalhe e reversa abrem em Dialog (sem trocar de página).
  const [detailCo, setDetailCo] = useState<string | null>(null);
  const [reversa, setReversa] = useState<ReversaTarget | null>(null);

  const keyField = config.keyField;
  const nameField = useMemo(
    () => config.columns.find((c) => c.kind !== "code")?.field,
    [config.columns]
  );

  const columns = useMemo<ColumnDef<Row>[]>(() => {
    const base: ColumnDef<Row>[] = config.columns.map((col) => ({
      id: col.field,
      accessorKey: col.field,
      header: col.header,
      enableHiding: true,
      cell: ({ row }) => renderDicValue(col.kind, row.original[col.field]),
      meta: {
        align: col.align,
        orderingField:
          col.kind === "code" || col.kind === "text" || col.kind == null
            ? (col.orderingField ?? col.field)
            : col.orderingField,
        csvHeader: col.header,
        csvValue: (row) => (row[col.field] as string | number | null) ?? "",
      },
    }));

    // Coluna de ação: ver procedimentos relacionados (recursos com reversa).
    if (config.reverse && keyField) {
      base.push({
        id: "__row_actions",
        header: "",
        enableHiding: false,
        enableSorting: false,
        meta: { align: "right" },
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setReversa({
                  co: String(row.original[keyField]),
                  name: nameField
                    ? (row.original[nameField] as string | undefined)
                    : undefined,
                });
              }}
            >
              <Activity />
              <span className="hidden md:inline">Procedimentos</span>
            </Button>
          </div>
        ),
      });
    }
    return base;
  }, [config.columns, config.reverse, keyField, nameField]);

  const count = query.data?.count;
  const competencia = query.data?.competencia;

  // Busca inline (na toolbar da DataTable, junto aos botões de exportação),
  // exceto nos dicionários com filtros compostos em cascata (dedicatedFilterRow).
  const inlineSearch = !config.dedicatedFilterRow;
  const hasFilters = (config.filters?.length ?? 0) > 0;

  const activeFilters: ActiveFilter[] = [];
  // Com busca inline, a própria SearchInput da toolbar tem botão de limpar — não
  // duplicamos o chip de "Busca".
  if (search && !inlineSearch)
    activeFilters.push({
      key: "search",
      label: "Busca",
      value: search,
      onRemove: () => setSearch(""),
    });
  for (const f of config.filters ?? []) {
    const v = filterValues[f.param];
    if (v)
      activeFilters.push({
        key: f.param,
        label: f.label,
        value: v,
        onRemove: () => setFilters({ [f.param]: undefined }),
      });
  }

  // Filtro segmentado da toolbar (ex.: Tipo A/H do SIA/SIH). A 1ª opção limpa.
  const toolbarFilter = config.toolbarFilter;
  const toolbarStart = toolbarFilter ? (
    <Segmented
      ariaLabel={toolbarFilter.ariaLabel}
      value={filterValues[toolbarFilter.param] ?? toolbarFilter.options[0].value}
      options={toolbarFilter.options}
      onChange={(v) =>
        setFilters({
          [toolbarFilter.param]:
            v === toolbarFilter.options[0].value ? undefined : v,
        })
      }
    />
  ) : undefined;

  return (
    <div className="space-y-5">
      <Breadcrumbs items={[{ label: "Início", to: "/" }, { label: config.label }]} />

      <PageHeader
        title={config.label}
        meta={
          count != null ? (
            <>
              {formatInt(count)} {count === 1 ? "registro" : "registros"}
              {config.versioned && competencia && (
                <> · competência {formatCompetencia(competencia)}</>
              )}
            </>
          ) : (
            "Carregando…"
          )
        }
      />

      {(!inlineSearch || hasFilters || activeFilters.length > 0) && (
        <div className="space-y-3">
          {!inlineSearch && (
            <SearchInput
              value={search}
              onDebouncedChange={setSearch}
              placeholder={config.searchPlaceholder}
              className="sm:max-w-md sm:flex-1"
            />
          )}

          {hasFilters && config.filters && (
            <DictionaryFilters
              filters={config.filters}
              values={filterValues}
              versioned={config.versioned}
              onChange={(patch) => setFilters(patch)}
            />
          )}

          <FilterChips
            filters={activeFilters}
            onClearAll={() =>
              setFilters({
                search: undefined,
                ...Object.fromEntries(
                  (config.filters ?? []).map((f) => [f.param, undefined])
                ),
              })
            }
          />
        </div>
      )}

      <DataTable
        columns={columns}
        data={query.data?.results}
        count={count}
        getRowKey={(row) =>
          String(
            config.keyField
              ? row[config.keyField]
              : config.columns.map((c) => row[c.field]).join("·")
          )
        }
        page={page}
        pageSize={pageSize}
        ordering={ordering}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onOrderingChange={setOrdering}
        searchValue={inlineSearch ? search : undefined}
        onSearchChange={inlineSearch ? setSearch : undefined}
        searchPlaceholder={
          inlineSearch
            ? (config.searchPlaceholder ?? "Buscar por código ou nome…")
            : undefined
        }
        toolbarStart={toolbarStart}
        isLoading={query.isLoading}
        isFetching={query.isFetching}
        error={query.error}
        onRetry={() => query.refetch()}
        onRowClick={
          keyField
            ? (row) => setDetailCo(String(row[keyField]))
            : undefined
        }
        caption={`Lista de ${config.label}`}
        csvFilename={`${config.key}.csv`}
        emptyState={
          <EmptyState
            title="Nenhum resultado"
            description={
              activeFilters.length
                ? "Ajuste a busca ou os filtros."
                : `Nenhum registro de ${config.label.toLowerCase()} nesta competência.`
            }
          />
        }
      />

      {keyField && (
        <DictionaryDetailDialog
          config={config}
          co={detailCo}
          open={detailCo != null}
          onOpenChange={(o) => {
            if (!o) setDetailCo(null);
          }}
          onVerProcedimentos={
            config.reverse
              ? (co, name) => {
                setDetailCo(null);
                setReversa({ co, name });
              }
              : undefined
          }
        />
      )}

      {config.reverse && (
        <ReversaDialog
          kind={config.reverse}
          co={reversa?.co ?? null}
          entityName={reversa?.name}
          open={reversa != null}
          onOpenChange={(o) => {
            if (!o) setReversa(null);
          }}
        />
      )}
    </div>
  );
}
