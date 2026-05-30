import { createContext } from "react";
import type { Competencia } from "@/api/types";

export interface CompetenciaContextValue {
  /** Competência selecionada (AAAAMM) — pode ser undefined enquanto carrega. */
  competencia: string | undefined;
  /** Define a competência globalmente; `undefined` volta para a vigente. */
  setCompetencia: (codigo: string | undefined) => void;
  /** Lista de competências disponíveis. */
  competencias: Competencia[];
  /** Código da competência vigente. */
  vigente: string | undefined;
  /** A seleção atual é a vigente? */
  isVigente: boolean;
  isLoading: boolean;
  isError: boolean;
}

export const CompetenciaContext = createContext<CompetenciaContextValue | null>(
  null
);
