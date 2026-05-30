import { useMemo, useState } from "react";
import { useProcRelation } from "@/api/queries";
import { DataTable } from "@/components/data-table/DataTable";
import { EmptyState } from "@/components/common/states";
import { DEFAULT_PAGE_SIZE } from "@/lib/url";
import type { RelationTabDef } from "./relations";

// Relações de um procedimento são limitadas; carregamos até 200 itens (máximo
// da API) e filtramos/paginamos no cliente. Isso porque o `search` server-side
// das sub-rotas de relação não filtra pelos campos da entidade relacionada.
const RELATION_FETCH_SIZE = 200;

/** Remove acentos e baixa a caixa, para um filtro mais tolerante. */
function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

/** Texto pesquisável de uma linha (só valores, recursivo nas relações). */
function rowText(value: unknown): string {
  if (value == null) return "";
  if (typeof value !== "object") return String(value);
  return Object.values(value as Record<string, unknown>)
    .map(rowText)
    .join(" ");
}

/**
 * Conteúdo de uma aba de relação. Monta apenas quando a aba está ativa
 * (carregamento sob demanda) com busca e paginação no cliente.
 */
export function RelationTabPanel({
  co,
  tab,
}: {
  co: string;
  tab: RelationTabDef;
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState("");

  const query = useProcRelation<unknown>(co, tab.key, {
    page: 1,
    page_size: RELATION_FETCH_SIZE,
  });

  const allRows = useMemo(() => query.data?.results ?? [], [query.data]);

  const filtered = useMemo(() => {
    if (!search.trim()) return allRows;
    const q = normalize(search);
    return allRows.filter((row) => normalize(rowText(row)).includes(q));
  }, [allRows, search]);

  const pageRows = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  );

  return (
    <DataTable
      columns={tab.columns}
      data={query.isLoading ? undefined : pageRows}
      count={filtered.length}
      getRowKey={tab.getRowKey}
      page={page}
      pageSize={pageSize}
      onPageChange={setPage}
      onPageSizeChange={(s) => {
        setPageSize(s);
        setPage(1);
      }}
      searchValue={search}
      onSearchChange={(v) => {
        setSearch(v);
        setPage(1);
      }}
      searchPlaceholder={`Filtrar ${tab.label.toLowerCase()}…`}
      isLoading={query.isLoading}
      isFetching={query.isFetching}
      error={query.error}
      onRetry={() => query.refetch()}
      enableColumnVisibility={false}
      enableDensityToggle={false}
      caption={`Relação: ${tab.label}`}
      exportTitle={`Procedimento ${co} — ${tab.label}`}
      csvFilename={`procedimento-${co}-${tab.key}.csv`}
      emptyState={
        search ? (
          <EmptyState
            title="Nada encontrado"
            description="Nenhum item corresponde ao filtro digitado."
          />
        ) : (
          <EmptyState
            title="Sem itens"
            description={`Este procedimento não possui ${tab.label.toLowerCase()} nesta competência.`}
          />
        )
      }
    />
  );
}
