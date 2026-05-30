import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useCompetencias } from "@/api/queries";
import {
  CompetenciaContext,
  type CompetenciaContextValue,
} from "@/app/competencia-context";

const STORAGE_KEY = "sigtap-competencia";

function readStored(): string | undefined {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

export function CompetenciaProvider({ children }: { children: React.ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, isLoading, isError } = useCompetencias();

  const competencias = useMemo(() => data?.results ?? [], [data]);
  const vigente = useMemo(
    () => competencias.find((c) => c.vigente)?.codigo,
    [competencias]
  );

  const urlParam = searchParams.get("competencia") ?? undefined;
  const stored = readStored();

  // Prioridade: URL > localStorage > vigente.
  const competencia = urlParam ?? stored ?? vigente;

  const setCompetencia = useCallback(
    (codigo: string | undefined) => {
      // undefined ou igual à vigente → volta ao padrão (URL limpa).
      const useDefault = codigo == null || codigo === vigente;
      try {
        if (useDefault) localStorage.removeItem(STORAGE_KEY);
        else localStorage.setItem(STORAGE_KEY, codigo);
      } catch {
        /* ignore (modo privado etc.) */
      }
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (useDefault) next.delete("competencia");
          else next.set("competencia", codigo);
          // Trocar competência reinicia a paginação.
          next.delete("page");
          return next;
        },
        { replace: false }
      );
    },
    [setSearchParams, vigente]
  );

  const value: CompetenciaContextValue = useMemo(
    () => ({
      competencia,
      setCompetencia,
      competencias,
      vigente,
      isVigente: !!competencia && competencia === vigente,
      isLoading,
      isError,
    }),
    [competencia, setCompetencia, competencias, vigente, isLoading, isError]
  );

  return (
    <CompetenciaContext.Provider value={value}>
      {children}
    </CompetenciaContext.Provider>
  );
}
