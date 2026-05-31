import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useDictionaryList } from "@/api/queries";
import type { Financiamento, Modalidade, ProcedimentoFiltros } from "@/api/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SearchInput } from "@/components/filters/SearchInput";
import { FilterSelect } from "@/components/filters/FilterSelect";
import {
  CascadeHierarquia,
  type HierarquiaValue,
} from "@/components/filters/CascadeHierarquia";
import { TP_COMPLEXIDADE, TP_SEXO, labelOptions } from "@/lib/labels";

interface Props {
  filtros: ProcedimentoFiltros;
  search: string;
  onSearch: (v: string) => void;
  onChange: (patch: Partial<ProcedimentoFiltros>) => void;
  activeAdvancedCount: number;
}

export function ProcedimentoFilters({
  filtros,
  search,
  onSearch,
  onChange,
  activeAdvancedCount,
}: Props) {
  const [open, setOpen] = useState(activeAdvancedCount > 0);

  const financiamentosQ = useDictionaryList<Financiamento>(
    "financiamentos",
    "/financiamentos",
    { page_size: 200, ordering: "co_financiamento" },
    true
  );
  const modalidadesQ = useDictionaryList<Modalidade>(
    "modalidades",
    "/modalidades",
    { page_size: 200, ordering: "co_modalidade" },
    true
  );

  const financiamentoOpts = useMemo(
    () =>
      (financiamentosQ.data?.results ?? []).map((f) => ({
        value: f.co_financiamento,
        label: `${f.co_financiamento} — ${f.no_financiamento ?? ""}`.trim(),
      })),
    [financiamentosQ.data]
  );
  const modalidadeOpts = useMemo(
    () =>
      (modalidadesQ.data?.results ?? []).map((m) => ({
        value: m.co_modalidade,
        label: `${m.co_modalidade} — ${m.no_modalidade ?? ""}`.trim(),
      })),
    [modalidadesQ.data]
  );

  const hierarquia: HierarquiaValue = {
    grupo: filtros.grupo,
    sub_grupo: filtros.sub_grupo,
    forma_organizacao: filtros.forma_organizacao,
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onDebouncedChange={onSearch}
          placeholder="Buscar por código ou nome do procedimento…"
          className="sm:flex-1"
          autoFocus
        />
        <Button
          variant="outline"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          <SlidersHorizontal />
          Filtros avançados
          {activeAdvancedCount > 0 && (
            <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-sky-700 text-primary-foreground hover:bg-sky-800 px-1.5 text-xs font-semibold">
              {activeAdvancedCount}
            </span>
          )}
        </Button>
      </div>

      {open && (
        <Card className="space-y-4 p-4">
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Hierarquia
            </h3>
            <CascadeHierarquia
              value={hierarquia}
              onChange={(next) =>
                onChange({
                  grupo: next.grupo,
                  sub_grupo: next.sub_grupo,
                  forma_organizacao: next.forma_organizacao,
                })
              }
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <FilterSelect
              label="Financiamento"
              value={filtros.financiamento}
              options={financiamentoOpts}
              loading={financiamentosQ.isLoading}
              onChange={(v) => onChange({ financiamento: v })}
            />
            <FilterSelect
              label="Modalidade"
              value={filtros.modalidade}
              options={modalidadeOpts}
              loading={modalidadesQ.isLoading}
              onChange={(v) => onChange({ modalidade: v })}
            />
            <FilterSelect
              label="Complexidade"
              value={filtros.complexidade}
              options={labelOptions(TP_COMPLEXIDADE)}
              onChange={(v) => onChange({ complexidade: v })}
            />
            <FilterSelect
              label="Sexo"
              value={filtros.sexo}
              options={labelOptions(TP_SEXO)}
              onChange={(v) => onChange({ sexo: v })}
            />
          </div>
        </Card>
      )}
    </div>
  );
}
