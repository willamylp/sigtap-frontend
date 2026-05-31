import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  Rows2,
  Rows3,
  SlidersHorizontal,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState, ErrorState } from "@/components/common/states";
import { SearchInput } from "@/components/filters/SearchInput";
import { cn } from "@/lib/utils";
import { DataTablePagination } from "./DataTablePagination";
import { downloadCsv, downloadExcel, printTable, type ExportCell } from "./export";
import type { Density } from "./types";

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[] | undefined;
  count: number | undefined;
  getRowKey: (row: T) => string;

  page: number;
  pageSize: number;
  ordering?: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onOrderingChange?: (ordering: string | undefined) => void;

  /** Sem dados ainda (primeira carga). */
  isLoading: boolean;
  /** Refetch em segundo plano (paginação/ordenção) — mantém dados antigos. */
  isFetching?: boolean;
  error?: unknown;
  onRetry?: () => void;

  rowHref?: (row: T) => string | undefined;
  onRowClick?: (row: T) => void;

  emptyState?: React.ReactNode;
  caption?: string;

  /** Busca embutida na toolbar (opcional). Quando definida, renderiza o campo. */
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  /** Conteúdo no início da toolbar, antes da busca (ex.: filtro segmentado). */
  toolbarStart?: React.ReactNode;

  enableColumnVisibility?: boolean;
  enableDensityToggle?: boolean;
  /** Habilita exportação (CSV/Excel) e impressão. */
  enableExport?: boolean;
  /** Nome-base do arquivo exportado (a extensão é ajustada por formato). */
  csvFilename?: string;
  /** Título usado na impressão (default: `caption`). */
  exportTitle?: string;

  toolbarExtra?: React.ReactNode;
}

const SKELETON_ROWS = 8;

export function DataTable<T>({
  columns,
  data,
  count,
  getRowKey,
  page,
  pageSize,
  ordering,
  onPageChange,
  onPageSizeChange,
  onOrderingChange,
  isLoading,
  isFetching,
  error,
  onRetry,
  rowHref,
  onRowClick,
  emptyState,
  caption,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  toolbarStart,
  enableColumnVisibility = true,
  enableDensityToggle = true,
  enableExport = true,
  csvFilename = "sigtap.csv",
  exportTitle,
  toolbarExtra,
}: DataTableProps<T>) {
  const navigate = useNavigate();
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [density, setDensity] = useState<Density>("comfortable");

  const table = useReactTable({
    data: data ?? [],
    columns,
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    getRowId: (row) => getRowKey(row),
  });

  const visibleLeafColumns = table.getVisibleLeafColumns();

  const orderingState = useMemo(() => {
    if (!ordering) return null;
    const desc = ordering.startsWith("-");
    return { field: desc ? ordering.slice(1) : ordering, desc };
  }, [ordering]);

  function cycleSort(field: string) {
    if (!onOrderingChange) return;
    if (orderingState?.field !== field) {
      onOrderingChange(field); // asc
    } else if (!orderingState.desc) {
      onOrderingChange(`-${field}`); // desc
    } else {
      onOrderingChange(undefined); // none
    }
  }

  /** Monta cabeçalhos + linhas (texto) da página atual para exportação. */
  function buildExportMatrix(): { headers: string[]; rows: ExportCell[][] } {
    const rows = data ?? [];
    const cols = visibleLeafColumns.filter((c) => c.id !== "__row_actions");
    const headers = cols.map(
      (c) => c.columnDef.meta?.csvHeader ?? csvHeaderText(c.columnDef.header, c.id)
    );
    const matrix = rows.map((row) =>
      cols.map((c) => {
        const csvValue = c.columnDef.meta?.csvValue;
        return (
          csvValue ? csvValue(row) : (row as Record<string, unknown>)[c.id]
        ) as ExportCell;
      })
    );
    return { headers, rows: matrix };
  }

  const exportTitleText = exportTitle ?? caption ?? "SIGTAP";
  const hasData = !!data && data.length > 0;

  const showToolbar =
    !!onSearchChange ||
    !!toolbarStart ||
    enableColumnVisibility ||
    enableDensityToggle ||
    enableExport ||
    toolbarExtra;

  const cellPadding = density === "compact" ? "py-1.5" : "py-2.5";
  const isInitialLoading = isLoading && !data;
  const isEmpty = !isInitialLoading && !error && (count === 0 || (data?.length ?? 0) === 0);

  return (
    <div className="space-y-3">
      {showToolbar && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {onSearchChange || toolbarStart ? (
            <div className="flex flex-col gap-2 sm:flex-1 sm:flex-row sm:items-center">
              {toolbarStart}
              {onSearchChange && (
                <SearchInput
                  value={searchValue ?? ""}
                  onDebouncedChange={onSearchChange}
                  placeholder={searchPlaceholder ?? "Filtrar nesta tabela…"}
                  className="sm:max-w-xs sm:flex-1"
                />
              )}
            </div>
          ) : (
            <div className="hidden sm:block" />
          )}

          <div className="flex items-center justify-end gap-2">
            {toolbarExtra}
            {enableDensityToggle && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setDensity((d) => (d === "compact" ? "comfortable" : "compact"))
                }
                title="Alternar densidade"
              >
                {density === "compact" ? <Rows3 /> : <Rows2 />}
                <span className="hidden sm:inline">
                  {density === "compact" ? "Confortável" : "Compacto"}
                </span>
              </Button>
            )}
            {enableExport && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const { headers, rows } = buildExportMatrix();
                    printTable(headers, rows, exportTitleText);
                  }}
                  disabled={!hasData}
                  title="Imprimir a página atual"
                >
                  <Printer />
                  <span className="hidden sm:inline">Imprimir</span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" disabled={!hasData}>
                      <Download />
                      <span className="hidden sm:inline">Exportar</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuLabel>Exportar página</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        const { headers, rows } = buildExportMatrix();
                        downloadCsv(headers, rows, csvFilename);
                      }}
                      className="cursor-pointer"
                    >
                      <FileText />
                      CSV (.csv)
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        const { headers, rows } = buildExportMatrix();
                        downloadExcel(headers, rows, csvFilename);
                      }}
                      className="cursor-pointer"
                    >
                      <FileSpreadsheet />
                      Excel (.xls)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
            {enableColumnVisibility && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <SlidersHorizontal />
                    <span className="hidden sm:inline">Colunas</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Colunas visíveis</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {table
                    .getAllLeafColumns()
                    .filter((c) => c.getCanHide() && c.id !== "__row_actions")
                    .map((c) => (
                      <DropdownMenuCheckboxItem
                        key={c.id}
                        checked={c.getIsVisible()}
                        onCheckedChange={(v) => c.toggleVisibility(!!v)}
                        onSelect={(e) => e.preventDefault()}
                        className="cursor-pointer"
                      >
                        {csvHeaderText(c.columnDef.header, c.id)}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      )}

      <div className="relative overflow-hidden rounded-lg border border-border bg-card">
        {error && !data ? (
          <div className="p-2">
            <ErrorState error={error} onRetry={onRetry} />
          </div>
        ) : isEmpty ? (
          <div className="p-2">{emptyState ?? <EmptyState />}</div>
        ) : (
          <div className="max-h-[calc(100vh-16rem)] overflow-auto">
            <Table>
              {caption && <caption className="sr-only">{caption}</caption>}
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id} className="hover:bg-transparent">
                    {hg.headers.map((header) => {
                      const meta = header.column.columnDef.meta;
                      const orderingField = meta?.orderingField;
                      const align = meta?.align ?? "left";
                      const sorted =
                        orderingField && orderingState?.field === orderingField
                          ? orderingState.desc
                            ? "desc"
                            : "asc"
                          : false;
                      return (
                        <TableHead
                          key={header.id}
                          className={cn(
                            align === "right" && "text-right",
                            align === "center" && "text-center",
                            meta?.headerClassName
                          )}
                          aria-sort={
                            sorted === "asc"
                              ? "ascending"
                              : sorted === "desc"
                                ? "descending"
                                : orderingField
                                  ? "none"
                                  : undefined
                          }
                        >
                          {orderingField && onOrderingChange ? (
                            <button
                              type="button"
                              onClick={() => cycleSort(orderingField)}
                              className={cn(
                                "inline-flex items-center gap-1 rounded font-semibold uppercase tracking-wide hover:text-slate-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                                align === "right" && "flex-row-reverse"
                              )}
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              {sorted === "asc" ? (
                                <ArrowUp className="h-3.5 w-3.5" />
                              ) : sorted === "desc" ? (
                                <ArrowDown className="h-3.5 w-3.5" />
                              ) : (
                                <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />
                              )}
                            </button>
                          ) : header.isPlaceholder ? null : (
                            flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )
                          )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody
                className={cn(isFetching && "opacity-60 transition-opacity")}
              >
                {isInitialLoading
                  ? Array.from({ length: SKELETON_ROWS }).map((_, ri) => (
                    <TableRow key={`sk-${ri}`} className="hover:bg-transparent">
                      {visibleLeafColumns.map((c) => (
                        <TableCell key={c.id} className={cellPadding}>
                          <Skeleton className="h-4 w-full max-w-[12rem]" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                  : table.getRowModel().rows.map((row) => {
                    const href = rowHref?.(row.original);
                    const clickable = !!href || !!onRowClick;
                    return (
                      <TableRow
                        key={row.id}
                        className={cn(
                          clickable &&
                          "group cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring"
                        )}
                        tabIndex={clickable ? 0 : undefined}
                        onClick={
                          clickable
                            ? () => {
                              if (href) navigate(href);
                              else onRowClick?.(row.original);
                            }
                            : undefined
                        }
                        onKeyDown={
                          clickable
                            ? (e) => {
                              if (e.key === "Enter") {
                                if (href) navigate(href);
                                else onRowClick?.(row.original);
                              }
                            }
                            : undefined
                        }
                      >
                        {row.getVisibleCells().map((cell) => {
                          const meta = cell.column.columnDef.meta;
                          const align = meta?.align ?? "left";
                          return (
                            <TableCell
                              key={cell.id}
                              className={cn(
                                cellPadding,
                                align === "right" && "text-right",
                                align === "center" && "text-center",
                                meta?.cellClassName
                              )}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {!isEmpty && !(error && !data) && (
        <DataTablePagination
          count={count ?? 0}
          page={page}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          disabled={isInitialLoading}
        />
      )}
    </div>
  );
}

function csvHeaderText(header: unknown, fallback: string): string {
  return typeof header === "string" ? header : fallback;
}
