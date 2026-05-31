import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Briefcase,
  ClipboardList,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";
import { getCids, getOcupacoes } from "@/api/endpoints";
import { useCompetencia } from "@/hooks/useCompetencia";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AsyncCombobox } from "@/components/filters/AsyncCombobox";
import { SearchInput } from "@/components/filters/SearchInput";
import { relatorioPath } from "@/features/relatorios/registry";
import { formatCompetenciaExtenso } from "@/lib/format";
import type { Cid, Ocupacao } from "@/api/types";

interface Shortcut {
  to: string;
  label: string;
  icon: LucideIcon;
  desc: string;
}

const SHORTCUTS: Shortcut[] = [
  { to: "/procedimentos", label: "Procedimentos", icon: Activity, desc: "Buscar e filtrar a tabela" },
  { to: "/cids", label: "CIDs", icon: Stethoscope, desc: "Classificação de doenças" },
  { to: "/ocupacoes", label: "Ocupações (CBO)", icon: Briefcase, desc: "Profissionais habilitados" },
];

/** Atalhos para os relatórios de relacionamento (RF-09). */
const REPORT_SHORTCUTS: Shortcut[] = [
  {
    to: relatorioPath("procedimento-cbo"),
    label: "Procedimento × CBO",
    icon: Briefcase,
    desc: "Ocupações por procedimento (e vice-versa)",
  },
  {
    to: relatorioPath("procedimento-cid"),
    label: "Procedimento × CID",
    icon: Stethoscope,
    desc: "CIDs por procedimento (e vice-versa)",
  },
  {
    to: relatorioPath("procedimento-registro"),
    label: "Procedimento × Instrumento",
    icon: ClipboardList,
    desc: "Instrumento de registro por procedimento",
  },
];

export function HomePage() {
  const navigate = useNavigate();
  const { competencia, isVigente } = useCompetencia();

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-4">
      <header className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Consulta SIGTAP
        </h1>
        <p className="text-muted-foreground">
          Tabela Unificada de Procedimentos, Medicamentos e OPM do SUS.
          {competencia && (
            <>
              {" "}
              Competência vigente:{" "}
              <span className="font-medium text-foreground">
                {formatCompetenciaExtenso(competencia)}
              </span>
              {!isVigente && " (selecionada)"}.
            </>
          )}
        </p>
      </header>

      <Card>
        <CardContent className="pt-5">
          <SearchInput
            value=""
            onDebouncedChange={(v) => {
              if (v.trim())
                navigate(`/procedimentos?search=${encodeURIComponent(v.trim())}`);
            }}
            placeholder="Buscar procedimento por código ou nome…"
            autoFocus
          />
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                Ir para um CID
              </p>
              <AsyncCombobox<Cid>
                resource="cids"
                fetchPage={(search, page) =>
                  getCids({ search: search || undefined, page, page_size: 20 })
                }
                getValue={(c) => c.co_cid}
                getLabel={(c) => `${c.co_cid} — ${c.no_cid ?? ""}`}
                placeholder="Buscar CID…"
                onSelect={(c) => navigate(`/cids/${c.co_cid}`)}
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                Ir para uma ocupação (CBO)
              </p>
              <AsyncCombobox<Ocupacao>
                resource="ocupacoes"
                fetchPage={(search, page) =>
                  getOcupacoes({ search: search || undefined, page, page_size: 20 })
                }
                getValue={(o) => o.co_ocupacao}
                getLabel={(o) => `${o.co_ocupacao} — ${o.no_ocupacao ?? ""}`}
                placeholder="Buscar ocupação…"
                onSelect={(o) => navigate(`/ocupacoes/${o.co_ocupacao}`)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Atalhos
        </h2>
        <ShortcutGrid items={SHORTCUTS} onNavigate={navigate} />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Relatórios
        </h2>
        <ShortcutGrid items={REPORT_SHORTCUTS} onNavigate={navigate} />
      </div>
    </div>
  );
}

/** Grade de cartões de atalho. */
function ShortcutGrid({
  items,
  onNavigate,
}: {
  items: Shortcut[];
  onNavigate: (to: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((s) => (
        <Card
          key={s.to}
          className="group cursor-pointer transition-colors hover:border-primary/50 hover:bg-accent/40"
          onClick={() => onNavigate(s.to)}
        >
          <CardHeader className="flex-row items-center gap-3 space-y-0">
            <span className="rounded-lg bg-primary/10 p-2 text-primary">
              <s.icon className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <CardTitle className="text-base">{s.label}</CardTitle>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
