import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

const ALL = "__all__";

interface FilterSelectProps {
  label: string;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  options: SelectOption[];
  placeholder?: string;
  allLabel?: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

/** Select de filtro com opção "Todos" (limpa o filtro). */
export function FilterSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Selecionar…",
  allLabel = "Todos",
  disabled,
  loading,
  className,
}: FilterSelectProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select
        value={value ?? ALL}
        onValueChange={(v) => onChange(v === ALL ? undefined : v)}
        disabled={disabled || loading}
      >
        <SelectTrigger
          aria-busy={loading}
          className={cn(loading && "text-muted-foreground")}
        >
          <SelectValue placeholder={loading ? "Carregando…" : placeholder} />
          {loading && (
            <Loader2
              className="ml-auto h-3.5 w-3.5 shrink-0 animate-spin text-muted-foreground"
              aria-hidden
            />
          )}
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{allLabel}</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
