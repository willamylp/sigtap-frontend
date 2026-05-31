import { useEffect, useMemo, useState } from "react";
import { useDictionaryList } from "@/api/queries";
import { FilterSelect } from "@/components/filters/FilterSelect";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DicFilter } from "./registry";

type Row = Record<string, unknown>;
type Values = Record<string, string | undefined>;

/**
 * Linha de filtros de uma listagem de dicionário (PRD §11.4). Cada filtro pode
 * ser um **Select** carregado da API (cascata: a 1ª opção limpa; cada nível
 * depende dos anteriores) ou um **input de texto**. Os campos ocupam toda a
 * largura disponível (cada um `flex-1`).
 */
export function DictionaryFilters({
  filters,
  values,
  versioned,
  onChange,
}: {
  filters: DicFilter[];
  values: Values;
  versioned: boolean;
  /** Aplica o patch na URL (limpando os filhos da cascata quando necessário). */
  onChange: (patch: Values) => void;
}) {
  // Trocar um filtro limpa todos os subsequentes (são uma cascata ordenada).
  function handleChange(index: number, value: string | undefined) {
    const patch: Values = { [filters[index].param]: value };
    for (let j = index + 1; j < filters.length; j++) {
      patch[filters[j].param] = undefined;
    }
    onChange(patch);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      {filters.map((f, i) =>
        f.select ? (
          <SelectFilter
            key={f.param}
            filter={f}
            value={values[f.param]}
            values={values}
            versioned={versioned}
            onChange={(v) => handleChange(i, v)}
          />
        ) : (
          <TextFilterInput
            key={f.param}
            label={f.label}
            value={values[f.param] ?? ""}
            onCommit={(v) => handleChange(i, v || undefined)}
          />
        )
      )}
    </div>
  );
}

/** Select de filtro com opções carregadas da API (depende dos pais na cascata). */
function SelectFilter({
  filter,
  value,
  values,
  versioned,
  onChange,
}: {
  filter: DicFilter;
  value: string | undefined;
  values: Values;
  versioned: boolean;
  onChange: (value: string | undefined) => void;
}) {
  const select = filter.select!;
  const parents = select.parentParams ?? [];
  const disabled = parents.some((p) => !values[p]);

  const parentParams: Values = {};
  for (const p of parents) parentParams[p] = values[p];

  const query = useDictionaryList<Row>(
    `dicfilter:${select.path}`,
    select.path,
    { ...parentParams, page_size: 200, ordering: select.valueField },
    versioned,
    { enabled: !disabled }
  );

  const options = useMemo(() => {
    const seen = new Set<string>();
    const out: { value: string; label: string }[] = [];
    for (const row of query.data?.results ?? []) {
      const v = String(row[select.valueField] ?? "");
      if (!v || seen.has(v)) continue;
      seen.add(v);
      const name = select.labelField
        ? (row[select.labelField] as string | undefined)
        : undefined;
      out.push({ value: v, label: name ? `${v} — ${name}` : v });
    }
    return out;
  }, [query.data, select.valueField, select.labelField]);

  return (
    <FilterSelect
      className="sm:flex-1"
      label={filter.label}
      value={value}
      disabled={disabled}
      loading={!disabled && query.isLoading}
      options={options}
      placeholder={disabled ? "Selecione o filtro anterior" : "Selecionar…"}
      onChange={onChange}
    />
  );
}

/** Input de filtro textual (código) que confirma ao sair/Enter. */
function TextFilterInput({
  label,
  value,
  onCommit,
}: {
  label: string;
  value: string;
  onCommit: (value: string) => void;
}) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);
  return (
    <div className="space-y-1.5 sm:flex-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => onCommit(local)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onCommit(local);
        }}
        className="w-full"
        placeholder="código"
        inputMode="numeric"
      />
    </div>
  );
}
