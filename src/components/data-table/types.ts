import type { ColumnDef, RowData } from "@tanstack/react-table";

/**
 * Metadados de coluna usados pela DataTable.
 *  - `orderingField`: nome do campo aceito pela API em `ordering` (habilita
 *    ordenação server-side para a coluna).
 *  - `align`: alinhamento do conteúdo (números/moeda → direita).
 *  - `csvValue`: valor textual para exportação CSV (default = string da célula).
 */
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    orderingField?: string;
    align?: "left" | "right" | "center";
    headerClassName?: string;
    cellClassName?: string;
    csvValue?: (row: TData) => string | number | null | undefined;
    /** Cabeçalho em texto puro para o CSV. */
    csvHeader?: string;
  }
}

export type { ColumnDef };

export type Density = "comfortable" | "compact";
