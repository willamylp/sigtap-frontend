import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  /** Valor inicial (vindo da URL). */
  value: string;
  /** Disparado após o debounce. */
  onDebouncedChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  delay?: number;
  autoFocus?: boolean;
}

/** Campo de busca com debounce (~350 ms) e botão limpar. */
export function SearchInput({
  value,
  onDebouncedChange,
  placeholder = "Buscar por código ou nome…",
  className,
  delay = 350,
  autoFocus,
}: SearchInputProps) {
  const [local, setLocal] = useState(value);
  const debounced = useDebouncedValue(local, delay);
  const lastEmitted = useRef(value);

  // Mantém o input em sincronia quando a URL muda externamente (ex.: chip removido).
  useEffect(() => {
    setLocal(value);
    lastEmitted.current = value;
  }, [value]);

  useEffect(() => {
    if (debounced !== lastEmitted.current) {
      lastEmitted.current = debounced;
      onDebouncedChange(debounced);
    }
  }, [debounced, onDebouncedChange]);

  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9"
        autoFocus={autoFocus}
        type="search"
        aria-label="Buscar"
      />
      {local && (
        <button
          type="button"
          onClick={() => setLocal("")}
          aria-label="Limpar busca"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
