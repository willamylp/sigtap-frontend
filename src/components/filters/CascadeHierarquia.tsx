import { useMemo } from "react";
import { useDictionaryList } from "@/api/queries";
import type { FormaOrganizacao, Grupo, SubGrupo } from "@/api/types";
import { FilterSelect } from "./FilterSelect";

export interface HierarquiaValue {
  grupo?: string;
  sub_grupo?: string;
  forma_organizacao?: string;
}

/**
 * Filtro em cascata Grupo → Subgrupo → Forma de Organização (PRD §10.2).
 * Cada nível carrega opções via API conforme o anterior; limpar o pai limpa
 * os filhos. Tudo refletido na URL pelo componente pai.
 */
export function CascadeHierarquia({
  value,
  onChange,
}: {
  value: HierarquiaValue;
  onChange: (next: HierarquiaValue) => void;
}) {
  const { grupo, sub_grupo, forma_organizacao } = value;

  const gruposQ = useDictionaryList<Grupo>(
    "grupos",
    "/grupos",
    { page_size: 200, ordering: "co_grupo" },
    true
  );

  const subgruposQ = useDictionaryList<SubGrupo>(
    "subgrupos",
    "/subgrupos",
    { co_grupo: grupo, page_size: 200, ordering: "co_sub_grupo" },
    true,
    { enabled: !!grupo }
  );

  const formasQ = useDictionaryList<FormaOrganizacao>(
    "formas-organizacao",
    "/formas-organizacao",
    {
      co_grupo: grupo,
      co_sub_grupo: sub_grupo,
      page_size: 200,
      ordering: "co_forma_organizacao",
    },
    true,
    { enabled: !!grupo && !!sub_grupo }
  );

  const grupoOpts = useMemo(
    () =>
      (gruposQ.data?.results ?? []).map((g) => ({
        value: g.co_grupo,
        label: `${g.co_grupo} — ${g.no_grupo ?? ""}`.trim(),
      })),
    [gruposQ.data]
  );

  const subgrupoOpts = useMemo(
    () =>
      (subgruposQ.data?.results ?? []).map((s) => ({
        value: s.co_sub_grupo,
        label: `${s.co_sub_grupo} — ${s.no_sub_grupo ?? ""}`.trim(),
      })),
    [subgruposQ.data]
  );

  const formaOpts = useMemo(
    () =>
      (formasQ.data?.results ?? []).map((f) => ({
        value: f.co_forma_organizacao,
        label: `${f.co_forma_organizacao} — ${f.no_forma_organizacao ?? ""}`.trim(),
      })),
    [formasQ.data]
  );

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <FilterSelect
        label="Grupo"
        value={grupo}
        loading={gruposQ.isLoading}
        options={grupoOpts}
        onChange={(v) =>
          onChange({ grupo: v, sub_grupo: undefined, forma_organizacao: undefined })
        }
      />
      <FilterSelect
        label="Subgrupo"
        value={sub_grupo}
        disabled={!grupo}
        loading={subgruposQ.isLoading && !!grupo}
        options={subgrupoOpts}
        placeholder={grupo ? "Selecionar…" : "Escolha um grupo"}
        onChange={(v) =>
          onChange({ grupo, sub_grupo: v, forma_organizacao: undefined })
        }
      />
      <FilterSelect
        label="Forma de organização"
        value={forma_organizacao}
        disabled={!grupo || !sub_grupo}
        loading={formasQ.isLoading && !!sub_grupo}
        options={formaOpts}
        placeholder={sub_grupo ? "Selecionar…" : "Escolha um subgrupo"}
        onChange={(v) =>
          onChange({ grupo, sub_grupo, forma_organizacao: v })
        }
      />
    </div>
  );
}
