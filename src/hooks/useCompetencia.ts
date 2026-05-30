import { useContext } from "react";
import { CompetenciaContext } from "@/app/competencia-context";

/** Acessa a competência global. Deve ser usado dentro do CompetenciaProvider. */
export function useCompetencia() {
  const ctx = useContext(CompetenciaContext);
  if (!ctx) {
    throw new Error("useCompetencia deve ser usado dentro de CompetenciaProvider");
  }
  return ctx;
}
