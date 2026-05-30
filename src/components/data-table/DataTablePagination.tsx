import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PAGE_SIZE_OPTIONS } from "@/lib/url";
import { formatInt } from "@/lib/format";

interface Props {
  count: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  disabled?: boolean;
}

export function DataTablePagination({
  count,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  disabled,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  const safePage = Math.min(page, totalPages);
  const first = count === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const last = Math.min(safePage * pageSize, count);

  const [pageInput, setPageInput] = useState(String(safePage));
  useEffect(() => setPageInput(String(safePage)), [safePage]);

  function commitPageInput() {
    const n = Number(pageInput);
    if (Number.isFinite(n)) {
      const clamped = Math.min(Math.max(1, Math.floor(n)), totalPages);
      onPageChange(clamped);
    } else {
      setPageInput(String(safePage));
    }
  }

  return (
    <div className="flex flex-col gap-3 border-t border-border px-3 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="text-muted-foreground">
        {count > 0 ? (
          <>
            Exibindo <span className="font-medium text-foreground">{formatInt(first)}</span>
            –<span className="font-medium text-foreground">{formatInt(last)}</span> de{" "}
            <span className="font-medium text-foreground">{formatInt(count)}</span>
          </>
        ) : (
          "Nenhum resultado"
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Por página</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => onPageSizeChange(Number(v))}
          >
            <SelectTrigger className="h-8 w-[4.5rem]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={String(opt)}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(1)}
            disabled={disabled || safePage <= 1}
            aria-label="Primeira página"
          >
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(safePage - 1)}
            disabled={disabled || safePage <= 1}
            aria-label="Página anterior"
          >
            <ChevronLeft />
          </Button>

          <div className="flex items-center gap-1.5 px-1 text-muted-foreground">
            <Input
              className="h-8 w-14 text-center tabular-nums"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onBlur={commitPageInput}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitPageInput();
              }}
              aria-label="Ir para a página"
              inputMode="numeric"
            />
            <span className="whitespace-nowrap">de {formatInt(totalPages)}</span>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(safePage + 1)}
            disabled={disabled || safePage >= totalPages}
            aria-label="Próxima página"
          >
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(totalPages)}
            disabled={disabled || safePage >= totalPages}
            aria-label="Última página"
          >
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
