import { useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { Paginated } from "@/api/types";
import { cn } from "@/lib/utils";

interface AsyncComboboxProps<T> {
  /** Identificador para a queryKey. */
  resource: string;
  /** Busca uma página (search server-side + paginação). */
  fetchPage: (search: string, page: number) => Promise<Paginated<T>>;
  getValue: (item: T) => string;
  getLabel: (item: T) => string;
  /** Valor atualmente selecionado (apenas o código). */
  value?: string;
  onSelect: (item: T) => void;
  placeholder?: string;
  emptyText?: string;
  className?: string;
}

/**
 * Combobox com busca server-side (debounce) e "carregar mais" — nunca baixa a
 * lista inteira de uma vez (PRD §10.2 / §12).
 */
export function AsyncCombobox<T>({
  resource,
  fetchPage,
  getValue,
  getLabel,
  value,
  onSelect,
  placeholder = "Buscar…",
  emptyText = "Nada encontrado.",
  className,
}: AsyncComboboxProps<T>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debounced = useDebouncedValue(search, 350);

  const query = useInfiniteQuery({
    queryKey: ["combobox", resource, debounced],
    queryFn: ({ pageParam }) => fetchPage(debounced, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) =>
      lastPage.next ? pages.length + 1 : undefined,
    enabled: open,
    staleTime: 60_000,
  });

  const items = useMemo(
    () => query.data?.pages.flatMap((p) => p.results) ?? [],
    [query.data]
  );

  const selectedLabel = useMemo(() => {
    if (!value) return undefined;
    const found = items.find((it) => getValue(it) === value);
    return found ? getLabel(found) : value;
  }, [value, items, getValue, getLabel]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between font-normal", className)}
        >
          <span className="truncate">
            {selectedLabel ?? <span className="text-muted-foreground">{placeholder}</span>}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={placeholder}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {query.isLoading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
              </div>
            ) : items.length === 0 ? (
              <CommandEmpty>{emptyText}</CommandEmpty>
            ) : (
              <CommandGroup>
                {items.map((item) => {
                  const v = getValue(item);
                  return (
                    <CommandItem
                      key={v}
                      value={v}
                      onSelect={() => {
                        onSelect(item);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === v ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="truncate">{getLabel(item)}</span>
                    </CommandItem>
                  );
                })}
                {query.hasNextPage && (
                  <CommandItem
                    value="__load_more__"
                    onSelect={() => query.fetchNextPage()}
                    className="justify-center text-sm text-muted-foreground"
                  >
                    {query.isFetchingNextPage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Carregar mais…"
                    )}
                  </CommandItem>
                )}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
