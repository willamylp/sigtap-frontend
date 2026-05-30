import { useState } from "react";
import { useProcedimentosReversa, type ReversaKind } from "@/api/queries";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/data-table/DataTable";
import { EmptyState } from "@/components/common/states";
import { CopyCode } from "@/components/common/CopyCode";
import { formatCompetencia, formatInt } from "@/lib/format";
import { DEFAULT_PAGE_SIZE } from "@/lib/url";
import { useProcedimentoColumns } from "@/features/procedimentos/useProcedimentoColumns";
import { getDictionary } from "@/features/dicionarios/registry";

/**
 * Lista de procedimentos relacionados a um registro (CID, CBO, serviço,
 * modalidade ou habilitação) aberta em Dialog. Clicar numa linha navega para o
 * detalhe do procedimento (página própria).
 */
export function ReversaDialog({
  kind,
  co,
  entityName,
  open,
  onOpenChange,
}: {
  kind: ReversaKind;
  co: string | null;
  entityName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const config = getDictionary(kind)!;
  const columns = useProcedimentoColumns();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [ordering, setOrdering] = useState<string | undefined>("co_procedimento");
  const [search, setSearch] = useState("");

  const query = useProcedimentosReversa(kind, co ?? undefined, {
    page,
    page_size: pageSize,
    ordering,
    search: search || undefined,
  });

  const count = query.data?.count;
  const competencia = query.data?.competencia;

  // Reinicia o estado ao fechar (próxima abertura começa limpa).
  function handleOpenChange(next: boolean) {
    if (!next) {
      setPage(1);
      setOrdering("co_procedimento");
      setSearch("");
    }
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-5xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Procedimentos relacionados</DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>{config.labelSingular}</span>
            {co && <CopyCode value={co} className="text-foreground" />}
            {entityName && <span className="text-foreground">{entityName}</span>}
            {count != null && (
              <span>
                · {formatInt(count)}{" "}
                {count === 1 ? "procedimento" : "procedimentos"}
                {competencia && <> · competência {formatCompetencia(competencia)}</>}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <DataTable
            columns={columns}
            data={query.data?.results}
            count={count}
            getRowKey={(row) => row.co_procedimento}
            page={page}
            pageSize={pageSize}
            ordering={ordering}
            onPageChange={setPage}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setPage(1);
            }}
            onOrderingChange={(o) => {
              setOrdering(o);
              setPage(1);
            }}
            searchValue={search}
            onSearchChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            searchPlaceholder="Filtrar procedimentos…"
            isLoading={query.isLoading}
            isFetching={query.isFetching}
            error={query.error}
            onRetry={() => query.refetch()}
            rowHref={(row) => `/procedimentos/${encodeURIComponent(row.co_procedimento)}`}
            enableColumnVisibility={false}
            caption={`Procedimentos de ${config.labelSingular} ${co ?? ""}`}
            exportTitle={`Procedimentos — ${config.labelSingular} ${co ?? ""}`}
            csvFilename={`procedimentos-${kind}-${co ?? ""}.csv`}
            emptyState={
              <EmptyState
                title="Sem procedimentos"
                description={`Nenhum procedimento relacionado a este ${config.labelSingular.toLowerCase()} nesta competência.`}
              />
            }
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
