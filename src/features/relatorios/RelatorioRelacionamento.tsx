/**
 * Tela única e config-driven dos Relatórios de Relacionamentos (PRD §4.3 / §6.1).
 *
 * Renderiza qualquer relatório a partir de uma `RelatorioConfig`:
 *  - alterna o **sentido** "Por Procedimento" / "Por <Entidade>" (RF-04), quando
 *    o relatório é bidirecional;
 *  - fixa a **âncora** (um procedimento via cascata + combobox; ou uma entidade
 *    via combobox assíncrono) — RF-05;
 *  - lista o outro lado numa `DataTable` paginada, com estados, formatação pt-BR,
 *    filtros extras client-side (Tipo CID / Categoria CBO — RF-07/§7) e
 *    exportação CSV/XLSX da página carregada (RF-08).
 *
 * Todo o estado (sentido, âncora, filtros, página, ordenação) vive na URL —
 * consulta compartilhável/bookmarkável (RF-11). A competência é a global.
 */
import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useProcRelation, useProcedimentosReversa } from "@/api/queries";
import { getProcedimentos } from "@/api/endpoints";
import type { ProcedimentoList } from "@/api/types";
import { useCompetencia } from "@/hooks/useCompetencia";
import { useListUrlState } from "@/hooks/useListUrlState";
import { readParam } from "@/lib/url";
import { PageHeader } from "@/components/common/PageHeader";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { EmptyState } from "@/components/common/states";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AsyncCombobox } from "@/components/filters/AsyncCombobox";
import { CascadeHierarquia } from "@/components/filters/CascadeHierarquia";
import { Segmented } from "@/components/filters/Segmented";
import { DataTable } from "@/components/data-table/DataTable";
import { formatCompetencia, formatInt } from "@/lib/format";
import { useProcedimentoColumns } from "@/features/procedimentos/useProcedimentoColumns";
import { type RelatorioConfig } from "./registry";

type Row = Record<string, unknown>;
type Sentido = "procedimento" | "entidade";

export function RelatorioRelacionamento({ config }: { config: RelatorioConfig }) {
  const { competencia } = useCompetencia();
  const {
    searchParams,
    page,
    pageSize,
    ordering,
    search,
    setPage,
    setPageSize,
    setOrdering,
    setSearch,
    setFilters,
  } = useListUrlState({ defaultOrdering: "co_procedimento" });

  const hasReverso = !!config.reverso;
  const sentidoUrl = readParam(searchParams, "sentido");
  const sentido: Sentido =
    sentidoUrl === "entidade" && hasReverso ? "entidade" : "procedimento";

  const ancora = readParam(searchParams, "ancora");
  const grupo = readParam(searchParams, "grupo");
  const sub_grupo = readParam(searchParams, "sub_grupo");
  const forma_organizacao = readParam(searchParams, "forma_organizacao");

  // Visão do sentido direto (base ou alternativa, ex.: Incremento).
  const hasAlt = !!config.diretoAlt;
  const viewUrl = readParam(searchParams, "view");
  const isAlt = hasAlt && viewUrl === config.diretoAlt!.id;
  const direto = isAlt ? config.diretoAlt! : config.direto;

  // Filtros extras client-side (§7).
  const extras = config.filtrosExtras ?? [];
  const tipoCid = readParam(searchParams, "tipoCid"); // principal | secundario
  const categoriaCbo = readParam(searchParams, "categoriaCbo");

  // ── Consultas (uma por sentido; habilitadas conforme a âncora) ─────────────
  const fwd = useProcRelation<Row>(
    ancora ?? "",
    direto.rel,
    { page, page_size: pageSize },
    { enabled: sentido === "procedimento" && !!ancora }
  );
  const rev = useProcedimentosReversa(
    config.reverso?.kind ?? "cids",
    sentido === "entidade" ? ancora : undefined,
    { page, page_size: pageSize, ordering, search: search || undefined }
  );

  const active = sentido === "procedimento" ? fwd : rev;
  const procColumns = useProcedimentoColumns();

  const columns = (
    sentido === "procedimento" ? direto.colunas : procColumns
  ) as ColumnDef<Row>[];

  const rawRows = (active.data?.results ?? []) as Row[];

  // Filtros client-side aplicam-se apenas ao sentido "Por Procedimento" e à
  // página carregada (§7). No sentido reverso, busca é server-side.
  const rows = useMemo(() => {
    if (sentido !== "procedimento") return rawRows;
    let r = rawRows;
    if (tipoCid === "principal") r = r.filter((x) => !!(x as Record<string, unknown>).st_principal);
    else if (tipoCid === "secundario") r = r.filter((x) => !(x as Record<string, unknown>).st_principal);
    if (categoriaCbo) {
      r = r.filter((x) => {
        const oc = (x as { ocupacao?: { co_ocupacao?: string } }).ocupacao;
        return String(oc?.co_ocupacao ?? "").startsWith(categoriaCbo);
      });
    }
    if (search) {
      const q = search.toLowerCase();
      r = r.filter((row) =>
        direto.colunas.some((c) => {
          const v = c.meta?.csvValue?.(row);
          return String(v ?? "").toLowerCase().includes(q);
        })
      );
    }
    return r;
  }, [rawRows, sentido, tipoCid, categoriaCbo, search, direto]);

  const getRowKey = useMemo(() => {
    if (sentido === "procedimento") return (row: Row) => direto.getRowKey(row);
    return (row: Row) => String((row as { co_procedimento?: string }).co_procedimento);
  }, [sentido, direto]);

  const count = active.data?.count;
  const comp = active.data?.competencia ?? competencia;

  // ── Mutações de estado (tudo na URL) ───────────────────────────────────────
  function switchSentido(next: Sentido) {
    if (next === sentido) return;
    setFilters({
      sentido: next === "entidade" ? "entidade" : undefined,
      ancora: undefined,
      ordering: undefined,
      search: undefined,
      tipoCid: undefined,
      categoriaCbo: undefined,
      view: undefined,
      grupo: undefined,
      sub_grupo: undefined,
      forma_organizacao: undefined,
    });
  }

  function switchView(toAlt: boolean) {
    setFilters({
      view: toAlt ? config.diretoAlt!.id : undefined,
      search: undefined,
    });
  }

  const filtrosAtivos =
    sentido === "procedimento" && !!(search || tipoCid || categoriaCbo);

  return (
    <div className="space-y-5">
      <Breadcrumbs
        items={[
          { label: "Início", to: "/" },
          { label: "Relatórios" },
          { label: "Relacionamentos" },
          { label: config.titulo },
        ]}
      />

      <PageHeader
        title={config.titulo}
        description={config.descricao}
        meta={
          !ancora ? (
            "Selecione uma âncora para consultar."
          ) : count != null ? (
            <>
              {formatInt(count)} {count === 1 ? "resultado" : "resultados"}
              {comp && <> · competência {formatCompetencia(comp)}</>}
            </>
          ) : (
            "Carregando…"
          )
        }
      />

      <Card className="space-y-4 p-4">
        {hasReverso && (
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Sentido da consulta</Label>
            <Segmented
              value={sentido}
              onChange={(v) => switchSentido(v as Sentido)}
              options={[
                { value: "procedimento", label: "Por Procedimento" },
                { value: "entidade", label: `Por ${config.entidadeLabel}` },
              ]}
            />
          </div>
        )}

        {sentido === "procedimento" ? (
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Filtrar procedimentos
              </h3>
              <CascadeHierarquia
                value={{ grupo, sub_grupo, forma_organizacao }}
                onChange={(next) =>
                  setFilters({
                    grupo: next.grupo,
                    sub_grupo: next.sub_grupo,
                    forma_organizacao: next.forma_organizacao,
                  })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Procedimento (âncora)
              </Label>
              <AsyncCombobox<ProcedimentoList>
                resource={`proc-anc:${grupo ?? ""}:${sub_grupo ?? ""}:${forma_organizacao ?? ""}:${competencia ?? ""}`}
                fetchPage={(s, p) =>
                  getProcedimentos({
                    search: s || undefined,
                    grupo,
                    sub_grupo,
                    forma_organizacao,
                    competencia,
                    page: p,
                    page_size: 20,
                    ordering: "co_procedimento",
                  })
                }
                getValue={(x) => x.co_procedimento}
                getLabel={(x) => `${x.co_procedimento} — ${x.no_procedimento ?? ""}`.trim()}
                value={ancora}
                onSelect={(x) => setFilters({ ancora: x.co_procedimento })}
                placeholder="Buscar procedimento por código ou nome…"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              {config.entidadeLabelSingular} (âncora)
            </Label>
            <AsyncCombobox
              resource={`${config.reverso!.resource}:${competencia ?? ""}`}
              fetchPage={config.reverso!.fetchOpcoes}
              getValue={config.reverso!.getValue}
              getLabel={config.reverso!.getLabel}
              value={ancora}
              onSelect={(x) => setFilters({ ancora: config.reverso!.getValue(x) })}
              placeholder={`Buscar ${config.entidadeLabelSingular} por código ou nome…`}
            />
          </div>
        )}

        {/* Visão alternativa (ex.: Incremento) — só no sentido direto. */}
        {sentido === "procedimento" && hasAlt && (
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Visão</Label>
            <Segmented
              value={isAlt ? "alt" : "base"}
              onChange={(v) => switchView(v === "alt")}
              options={[
                { value: "base", label: config.diretoAlt!.baseLabel },
                { value: "alt", label: config.diretoAlt!.label },
              ]}
            />
          </div>
        )}

        {/* Filtros extras client-side (§7). */}
        {sentido === "procedimento" && ancora && extras.includes("tipoCid") && (
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Tipo CID</Label>
            <Segmented
              value={tipoCid ?? "ambos"}
              onChange={(v) =>
                setFilters({ tipoCid: v === "ambos" ? undefined : v })
              }
              options={[
                { value: "ambos", label: "Ambos" },
                { value: "principal", label: "Principal" },
                { value: "secundario", label: "Secundário" },
              ]}
            />
          </div>
        )}

        {sentido === "procedimento" && ancora && extras.includes("categoriaCbo") && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <CategoriaCboInput
              value={categoriaCbo ?? ""}
              onCommit={(v) => setFilters({ categoriaCbo: v || undefined })}
            />
          </div>
        )}
      </Card>

      {!ancora ? (
        <Card className="p-2">
          <EmptyState
            title={
              sentido === "procedimento"
                ? "Selecione um procedimento"
                : `Selecione ${config.entidadeLabelSingular}`
            }
            description={
              sentido === "procedimento"
                ? `Use os filtros acima para escolher o procedimento âncora e listar ${config.entidadeLabel === "CBO" ? "as ocupações" : "os " + config.entidadeLabel.toLowerCase()} relacionados.`
                : `Escolha ${config.entidadeLabelSingular} para listar os procedimentos relacionados.`
            }
          />
        </Card>
      ) : (
        <div className="space-y-2">
          {filtrosAtivos && count != null && rows.length !== count && (
            <p className="text-xs text-muted-foreground">
              Filtro aplicado sobre a página atual: exibindo {formatInt(rows.length)} de{" "}
              {formatInt(count)} linha(s) carregada(s).
            </p>
          )}

          <DataTable
            columns={columns}
            data={rows}
            count={count}
            getRowKey={getRowKey}
            page={page}
            pageSize={pageSize}
            ordering={sentido === "entidade" ? ordering : undefined}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            onOrderingChange={sentido === "entidade" ? setOrdering : undefined}
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Filtrar resultados…"
            isLoading={active.isLoading}
            isFetching={active.isFetching}
            error={active.error}
            onRetry={() => active.refetch()}
            rowHref={
              sentido === "entidade"
                ? (row) =>
                    `/procedimentos/${encodeURIComponent(
                      String((row as { co_procedimento?: string }).co_procedimento)
                    )}`
                : undefined
            }
            enableColumnVisibility={sentido === "entidade"}
            caption={config.titulo}
            exportTitle={config.titulo}
            csvFilename={`${config.slug}_${comp ?? ""}.csv`}
            toolbarExtra={
              <span className="hidden text-xs text-muted-foreground lg:inline">
                Exporta a página atual
              </span>
            }
            emptyState={
              <EmptyState
                title="Nenhum relacionamento"
                description={`Nenhum resultado para esta seleção${comp ? ` na competência ${formatCompetencia(comp)}` : ""}.`}
              />
            }
          />
        </div>
      )}
    </div>
  );
}

/** Input da Categoria de CBO (4 primeiros dígitos) — confirma ao sair/Enter. */
function CategoriaCboInput({
  value,
  onCommit,
}: {
  value: string;
  onCommit: (value: string) => void;
}) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">Categoria (4 díg.)</Label>
      <Input
        value={local}
        onChange={(e) => setLocal(e.target.value.replace(/\D/g, "").slice(0, 4))}
        onBlur={() => onCommit(local)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onCommit(local);
        }}
        placeholder="ex.: 2236"
        inputMode="numeric"
      />
    </div>
  );
}
