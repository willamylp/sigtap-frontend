import { CalendarDays } from "lucide-react";
import { useCompetencia } from "@/hooks/useCompetencia";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCompetencia } from "@/lib/format";

/** Seletor global de competência (header) — aplica em todo o app (PRD §10.3). */
export function CompetenciaSelector() {
  const { competencia, setCompetencia, competencias, vigente, isLoading } =
    useCompetencia();

  if (isLoading) return <Skeleton className="h-9 w-36" />;
  if (competencias.length === 0) return null;

  return (
    <Select value={competencia} onValueChange={(v) => setCompetencia(v)}>
      <SelectTrigger className="h-9 w-[10.5rem] gap-2" aria-label="Competência">
        <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
        <SelectValue placeholder="Competência">
          {competencia ? formatCompetencia(competencia) : "Competência"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {competencias.map((c) => (
          <SelectItem key={c.codigo} value={c.codigo}>
            <span className="flex items-center gap-2">
              {formatCompetencia(c.codigo)}
              {c.codigo === vigente && (
                <Badge tone="success" className="px-1.5 py-0">
                  vigente
                </Badge>
              )}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
