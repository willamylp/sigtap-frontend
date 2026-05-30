import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  Building2,
  ChevronDown,
  Stethoscope,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useProcedimento, useRelationCounts } from "@/api/queries";
import { PageHeader } from "@/components/common/PageHeader";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { Section, KeyValue, KeyValueItem } from "@/components/common/KeyValue";
import { CopyCode } from "@/components/common/CopyCode";
import { CodeLink } from "@/components/common/CodeLink";
import { TpBadge } from "@/components/common/TpBadge";
import { IdadeCell } from "@/components/common/cells";
import { ErrorState } from "@/components/common/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  formatBRL,
  formatCompetencia,
  formatInt,
} from "@/lib/format";
import { TP_COMPLEXIDADE, TP_SEXO } from "@/lib/labels";
import { RecordLink } from "@/features/records/RecordLink";
import { RecordDialogProvider } from "@/features/records/RecordDialogProvider";
import { RELATION_TABS } from "./relations";
import { RelationTabPanel } from "./RelationTabPanel";

export function ProcedimentoDetailPage() {
  const { co } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = useProcedimento(co);
  const { counts } = useRelationCounts(co);

  const activeTab = searchParams.get("aba") ?? RELATION_TABS[0].key;
  const setActiveTab = (tab: string) =>
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("aba", tab);
        return next;
      },
      { replace: true }
    );

  if (query.isError) {
    return (
      <div className="space-y-5">
        <Breadcrumbs
          items={[
            { label: "Início", to: "/" },
            { label: "Procedimentos", to: "/procedimentos" },
            { label: co ?? "" },
          ]}
        />
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      </div>
    );
  }

  const p = query.data;

  return (
    <RecordDialogProvider>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Início", to: "/" },
            { label: "Procedimentos", to: "/procedimentos" },
            { label: co ?? "" },
          ]}
        />

      {query.isLoading || !p ? (
        <div className="space-y-4">
          <Skeleton className="h-9 w-3/4 max-w-xl" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <>
          <PageHeader
            title={p.no_procedimento}
            meta={
              <span className="flex flex-wrap items-center gap-2">
                <CopyCode value={p.co_procedimento} />
                <TpBadge code={p.tp_complexidade} map={TP_COMPLEXIDADE} />
                <TpBadge code={p.tp_sexo} map={TP_SEXO} />
                {p.competencia && (
                  <Badge tone="primary">
                    competência {formatCompetencia(p.competencia)}
                  </Badge>
                )}
              </span>
            }
          />

          {/* Valores SH / SA / SP em destaque */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <ValueCard tone="sh" label="Hospitalar" sublabel="Valor SH" value={p.vl_sh} icon={Building2} />
            <ValueCard tone="sa" label="Ambulatorial" sublabel="Valor SA" value={p.vl_sa} icon={Stethoscope} />
            <ValueCard tone="sp" label="Profissional" sublabel="Valor SP" value={p.vl_sp} icon={UserRound} />
          </div>

          {/* Resumo */}
          <Section title="Resumo">
            <KeyValue>
              <KeyValueItem label="Financiamento">
                {p.financiamento?.co_financiamento ? (
                  <span className="flex items-center gap-2">
                    <RecordLink
                      resource="financiamentos"
                      co={p.financiamento.co_financiamento}
                    />
                    <span>{p.financiamento.no_financiamento}</span>
                  </span>
                ) : (
                  "—"
                )}
              </KeyValueItem>
              <KeyValueItem label="Rubrica">
                {p.rubrica?.co_rubrica ? (
                  <span className="flex items-center gap-2">
                    <RecordLink resource="rubricas" co={p.rubrica.co_rubrica} />
                    <span>{p.rubrica.no_rubrica}</span>
                  </span>
                ) : (
                  "—"
                )}
              </KeyValueItem>
              <KeyValueItem label="Hierarquia">
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  {p.co_grupo && (
                    <RecordLink resource="grupos" co={p.co_grupo} />
                  )}
                  <span className="text-muted-foreground">›</span>
                  {p.co_sub_grupo && (
                    <CodeLink
                      to={`/subgrupos?co_grupo=${p.co_grupo}&co_sub_grupo=${p.co_sub_grupo}`}
                      code={p.co_sub_grupo}
                    />
                  )}
                  <span className="text-muted-foreground">›</span>
                  {p.co_forma_organizacao && (
                    <CodeLink
                      to={`/formas-organizacao?co_grupo=${p.co_grupo}&co_sub_grupo=${p.co_sub_grupo}&co_forma_organizacao=${p.co_forma_organizacao}`}
                      code={p.co_forma_organizacao}
                    />
                  )}
                  {p.forma_organizacao?.no_forma_organizacao && (
                    <span className="text-muted-foreground">
                      — {p.forma_organizacao.no_forma_organizacao}
                    </span>
                  )}
                </span>
              </KeyValueItem>
              <KeyValueItem label="Idade mínima">
                <IdadeCell meses={p.vl_idade_minima} />
              </KeyValueItem>
              <KeyValueItem label="Idade máxima">
                <IdadeCell meses={p.vl_idade_maxima} />
              </KeyValueItem>
              <KeyValueItem label="Qtd. máxima de execução">
                {formatInt(p.qt_maxima_execucao)}
              </KeyValueItem>
              <KeyValueItem label="Dias de permanência">
                {formatInt(p.qt_dias_permanencia)}
              </KeyValueItem>
              <KeyValueItem label="Tempo de permanência">
                {formatInt(p.qt_tempo_permanencia)}
              </KeyValueItem>
              <KeyValueItem label="Pontos">{formatInt(p.qt_pontos)}</KeyValueItem>
            </KeyValue>
          </Section>

          {p.descricao && <DescricaoBlock descricao={p.descricao} />}

          {/* Abas de relações */}
          <Section title="Relações">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="overflow-x-auto pb-1">
                <TabsList>
                  {RELATION_TABS.map((tab) => {
                    const count = counts[tab.key];
                    const isEmpty = count === 0;
                    return (
                      <TabsTrigger
                        key={tab.key}
                        value={tab.key}
                        disabled={isEmpty}
                        className={cn(isEmpty && "opacity-50")}
                      >
                        {tab.label}
                        {count != null && (
                          <span className="ml-1.5 rounded-full bg-muted-foreground/15 px-1.5 text-xs tabular-nums">
                            {formatInt(count)}
                          </span>
                        )}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </div>

              {RELATION_TABS.map((tab) => (
                <TabsContent key={tab.key} value={tab.key}>
                  {/* Monta apenas quando ativo → carregamento sob demanda. */}
                  {activeTab === tab.key && co && (
                    <RelationTabPanel co={co} tab={tab} />
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </Section>
        </>
      )}
      </div>
    </RecordDialogProvider>
  );
}

const VALUE_TONES = {
  sh: {
    chip: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300",
    bar: "from-indigo-500",
  },
  sa: {
    chip: "bg-sky-500/10 text-sky-600 dark:text-sky-300",
    bar: "from-sky-500",
  },
  sp: {
    chip: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    bar: "from-emerald-500",
  },
} as const;

function ValueCard({
  tone,
  label,
  sublabel,
  value,
  icon: Icon,
}: {
  tone: keyof typeof VALUE_TONES;
  label: string;
  sublabel: string;
  value: string | undefined;
  icon: LucideIcon;
}) {
  const t = VALUE_TONES[tone];
  return (
    <Card className="group relative overflow-hidden p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1.5 text-2xl font-semibold tracking-tight tabular-nums text-foreground">
            {formatBRL(value)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{sublabel}</p>
        </div>
        <span
          className={cn(
            "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
            t.chip
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <span
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r to-transparent opacity-70 transition-opacity group-hover:opacity-100",
          t.bar
        )}
      />
    </Card>
  );
}

function DescricaoBlock({ descricao }: { descricao: string }) {
  const [open, setOpen] = useState(false);
  const isLong = descricao.length > 400;
  return (
    <Section
      title="Descrição"
      actions={
        isLong ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
          >
            {open ? "Recolher" : "Expandir"}
            <ChevronDown
              className={cn("transition-transform", open && "rotate-180")}
            />
          </Button>
        ) : undefined
      }
    >
      <Card className="p-4">
        <p
          className={cn(
            "whitespace-pre-line text-sm leading-relaxed text-foreground",
            isLong && !open && "line-clamp-4"
          )}
        >
          {descricao}
        </p>
      </Card>
    </Section>
  );
}
