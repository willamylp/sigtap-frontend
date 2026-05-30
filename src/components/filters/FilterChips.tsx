import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ActiveFilter {
  key: string;
  label: string;
  value: string;
  onRemove: () => void;
}

/** Filtros ativos como chips removíveis + "Limpar filtros". */
export function FilterChips({
  filters,
  onClearAll,
  className,
}: {
  filters: ActiveFilter[];
  onClearAll: () => void;
  className?: string;
}) {
  if (filters.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {filters.map((f) => (
        <span
          key={f.key}
          className="inline-flex items-center gap-1 rounded-full border border-border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900 py-1 pl-2.5 pr-1 text-xs text-foreground shadow"
        >
          <span className="text-muted-foreground">{f.label}:</span>
          <span className="font-medium">{f.value}</span>
          <button
            type="button"
            onClick={f.onRemove}
            aria-label={`Remover filtro ${f.label}`}
            className="rounded-full p-0.5 text-muted-foreground hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs hover:text-red-700 hover:font-semibold transition-all duration-300"
        onClick={onClearAll}
      >
        Limpar filtros
      </Button>
    </div>
  );
}
