# PRD — Frontend (React + TailwindCSS) de consulta ao SIGTAP

> **Natureza deste documento:** especificação (PRD) para implementação posterior do
> **frontend**. A fonte da verdade da API é [SIGTAP_API.yaml](SIGTAP_API.yaml) (OpenAPI
> 3.0) e o backend já implementado (app `sigtap`). Para o modelo de dados e a semântica
> de domínio, ver [prd-sigtap.md](prd-sigtap.md). Onde o OpenAPI gerado diverge do
> comportamento real do backend, este PRD documenta o comportamento **real** (seção 5).

---

## 1. Visão geral

Construir uma **SPA (Single Page Application)** em **React + TypeScript + TailwindCSS**
que sirva de interface moderna para consultar a Tabela Unificada do SIGTAP, consumindo
a API REST somente-leitura já existente (`/api/v1/sigtap/`). O objetivo é substituir o
portal oficial do SIGTAP (lento, com UX/UI ruim e instável) por uma experiência rápida,
limpa e fácil — com **formulários de filtro** e **tabelas de listagem** modernas, busca
ágil, navegação fluida entre procedimentos e suas relações, e seletor global de
**competência**.

O domínio gira em torno do **Procedimento** (entidade central) e suas relações (CIDs,
ocupações/CBO, modalidades, serviços, habilitações, compatibilidades, etc.), além de
**dicionários** e da **hierarquia** grupo → subgrupo → forma de organização →
procedimento. A API é **pública (somente-leitura)** — não há login para consultar.

---

## 2. Objetivos e Não-Objetivos

**Objetivos**

- Tela de **busca e listagem de procedimentos** com filtros avançados (hierarquia,
  financiamento, modalidade, complexidade, sexo), busca por código/nome, ordenação e
  paginação — tudo refletido na URL (compartilhável/bookmarkável).
- **Página de detalhe do procedimento** com todos os atributos (valores SH/SA/SP,
  complexidade, financiamento, rubrica, idade, descrição longa) e **abas** para as ~16
  relações, carregadas sob demanda.
- **Consultas reversas**: dado um CID, CBO (ocupação), serviço, modalidade ou
  habilitação, listar os procedimentos relacionados.
- **Navegador de dicionários** (CIDs, ocupações, financiamentos, modalidades, etc.) com
  um padrão reutilizável de lista + busca.
- **Seletor global de competência** (`AAAAMM`), com a vigente como padrão.
- UI moderna, responsiva, acessível (WCAG 2.1 AA), com **dark mode**, skeletons de
  carregamento, estados vazios/erro tratados, e formatação pt-BR (moeda, idade).

**Não-Objetivos**

- Qualquer operação de **escrita** (a API é somente-leitura).
- **Autenticação/cadastro** de usuários no frontend (a API de consulta é pública). Ver
  §13 (Premissas) caso futuramente a API volte a exigir login.
- Implementação do **backend**, da importação de competência ou de telas administrativas
  (Django Admin permanece para isso).
- App mobile nativo (a SPA é responsiva, mas não é React Native).
- Tradução automática dos códigos de domínio (`TP_*`) — o frontend traz um **mapa de
  rótulos** mantido no próprio front (Anexo C), pois esses significados não vêm da API.

---

## 3. Personas e principais jornadas

**Personas:** faturistas/auditores do SUS, profissionais de regulação, analistas de
saúde e desenvolvedores — pessoas que hoje sofrem no portal oficial.

**Jornadas (devem ser fluidas e rápidas):**

1. **Localizar um procedimento** por código ou nome → abrir o detalhe → conferir valores
   e atributos → explorar CIDs/CBOs/compatíveis nas abas.
2. **Filtrar procedimentos** por grupo → subgrupo → forma de organização, +
   financiamento/modalidade/complexidade/sexo → ordenar por valor → paginar.
3. **Consulta reversa**: "quais procedimentos aceitam o CID C73?" / "quais procedimentos
   o CBO 223605 pode registrar?".
4. **Navegar um dicionário** (ex.: buscar um CID pelo nome) e saltar para seus
   procedimentos.
5. **Trocar a competência** e repetir qualquer consulta no período desejado.

---

## 4. Contexto técnico e premissas

- **Base da API:** `/api/v1/sigtap/` (confirmado em `app/urls.py`). Configurável por
  variável de ambiente no front (`VITE_API_BASE_URL`).
- **Somente-leitura e pública:** todos os endpoints são `GET` e **não exigem
  autenticação** (permissão `AllowAny`). Não há botão de "login" nem header
  `Authorization` nas consultas.
- **CORS liberado:** o backend está com `CORS_ALLOW_ALL_ORIGINS = True`, então a SPA pode
  ser servida em outra origem (ex.: `http://localhost:5173`) e chamar a API direto.
- **Competência:** recursos versionados aceitam `?competencia=AAAAMM`; sem o parâmetro,
  o backend usa a **competência vigente**. `/competencias/` lista as disponíveis e marca
  a vigente.
- **Paginação:** `PageNumberPagination` — `page` e `page_size` (default **50**, máximo
  **200**). Ver shape real em §5.2.
- **Implantação:** SPA independente (build estático Vite → Nginx/CDN/qualquer host
  estático), apontando para a URL da API por ambiente. Não precisa ser servida pelo
  Django.

---

## 5. Contrato de integração com a API (LEIA ANTES DE IMPLEMENTAR)

Esta seção documenta o **comportamento real** do backend. Em três pontos o OpenAPI
gerado ([SIGTAP_API.yaml](SIGTAP_API.yaml)) **não reflete** o runtime — siga este PRD.

### 5.1 Endpoints (inventário)

Base: `/api/v1/sigtap/`. Todos `GET`.

**Procedimentos (núcleo):**

| Endpoint | Retorno | Observações |
|---|---|---|
| `GET /procedimentos/` | Lista paginada de `ProcedimentoList` | Filtros em §5.4 |
| `GET /procedimentos/{co_procedimento}/` | `ProcedimentoDetail` | Inclui `descricao` (texto longo) inline |
| `GET /procedimentos/{co}/cids/` | Lista paginada de `ProcedimentoCid` | `{ cid, st_principal }` |
| `GET /procedimentos/{co}/ocupacoes/` | Lista de `ProcedimentoOcupacao` | `{ ocupacao }` |
| `GET /procedimentos/{co}/modalidades/` | Lista de `ProcedimentoModalidade` | `{ modalidade }` |
| `GET /procedimentos/{co}/servicos/` | Lista de `ProcedimentoServico` | `{ servico_classificacao }` |
| `GET /procedimentos/{co}/leitos/` | Lista de `ProcedimentoLeito` | `{ tipo_leito }` |
| `GET /procedimentos/{co}/registros/` | Lista de `ProcedimentoRegistro` | `{ registro }` |
| `GET /procedimentos/{co}/detalhes/` | Lista de `ProcedimentoDetalhe` | `{ detalhe }` |
| `GET /procedimentos/{co}/habilitacoes/` | Lista de `ProcedimentoHabilitacao` | `{ habilitacao, nu_grupo_habilitacao, grupo_habilitacao }` |
| `GET /procedimentos/{co}/incrementos/` | Lista de `ProcedimentoIncremento` | `{ habilitacao, vl_percentual_sh/sa/sp }` |
| `GET /procedimentos/{co}/compativeis/` | Lista de `ProcedimentoCompativel` | `{ procedimento_compativel, registro_principal, registro_compativel, tp_compatibilidade, qt_permitida }` |
| `GET /procedimentos/{co}/sia-sih/` | Lista de `ProcedimentoSiaSih` | `{ sia_sih, tp_procedimento }` |
| `GET /procedimentos/{co}/origem/` | Lista de `ProcedimentoOrigem` | `{ procedimento_origem }` |
| `GET /procedimentos/{co}/regras-condicionadas/` | Lista de `ProcedimentoRegraCond` | `{ regra_condicionada }` |
| `GET /procedimentos/{co}/renases/` | Lista de `ProcedimentoRenases` | `{ renases }` |
| `GET /procedimentos/{co}/redes/` | Lista de `ProcedimentoCompRede` | `{ componente_rede }` |
| `GET /procedimentos/{co}/tuss/` | Lista de `ProcedimentoTuss` | `{ tuss }` |
| `GET /procedimentos/{co}/descricao/` | `{ co_procedimento, ds_procedimento }` | Opcional — a descrição já vem no detalhe |

**Consultas reversas (→ lista paginada de `ProcedimentoList`):**

`GET /cids/{co_cid}/procedimentos/` · `GET /ocupacoes/{co_ocupacao}/procedimentos/` ·
`GET /modalidades/{co_modalidade}/procedimentos/` ·
`GET /servicos/{co_servico}/procedimentos/` ·
`GET /habilitacoes/{co_habilitacao}/procedimentos/`

**Dicionários / dimensões (cada um: `GET /<recurso>/` lista paginada + `GET /<recurso>/{chave}/` detalhe):**

| Recurso | Chave (lookup) | Schema | Filtros próprios |
|---|---|---|---|
| `competencias` | `codigo` | `Competencia` | — |
| `grupos` | `co_grupo` | `Grupo` | — |
| `subgrupos` | `id` ⚠️ | `SubGrupo` | `co_grupo`, `co_sub_grupo` |
| `formas-organizacao` | `id` ⚠️ | `FormaOrganizacao` | `co_grupo`, `co_sub_grupo`, `co_forma_organizacao` |
| `financiamentos` | `co_financiamento` | `Financiamento` | — |
| `rubricas` | `co_rubrica` | `Rubrica` | — |
| `modalidades` | `co_modalidade` | `Modalidade` | — |
| `registros` | `co_registro` | `Registro` | — |
| `servicos` | `co_servico` | `Servico` | — |
| `servico-classificacoes` | `id` ⚠️ | `ServicoClassificacao` | `co_servico`, `co_classificacao` |
| `tipos-leito` | `co_tipo_leito` | `TipoLeito` | — |
| `habilitacoes` | `co_habilitacao` | `Habilitacao` | — |
| `detalhes` | `co_detalhe` | `Detalhe` | — |
| `sia-sih` | `id` ⚠️ | `SiaSih` | `co_procedimento_sia_sih`, `tp_procedimento` |
| `cids` | `co_cid` | `Cid` | — |
| `ocupacoes` | `co_ocupacao` | `Ocupacao` | — |
| `grupos-habilitacao` | `nu_grupo_habilitacao` | `GrupoHabilitacao` | — |
| `regras-condicionadas` | `co_regra_condicionada` | `RegraCondicionada` | — |
| `redes-atencao` | `co_rede_atencao` | `RedeAtencao` | — |
| `componentes-rede` | `co_componente_rede` | `ComponenteRede` | — |
| `tuss` | `co_tuss` | `Tuss` | — |
| `renases` | `co_renases` | `Renases` | — |

Todos os recursos de lista aceitam `search`, `ordering`, `page`, `page_size` e
`competencia` (nos versionados).

### 5.2 Shape da paginação (⚠️ difere do OpenAPI)

Toda lista retorna, **além** de `count/next/previous/results`, o campo **`competencia`**
(a competência efetivamente consultada — útil para exibir "dados de AAAAMM"):

```jsonc
{
  "count": 4984,
  "next": "http://host/api/v1/sigtap/procedimentos/?page=2",
  "previous": null,
  "competencia": "202605",          // ⚠️ presente no runtime; ausente no SIGTAP_API.yaml
  "results": [ /* ... */ ]
}
```

### 5.3 ⚠️ Endpoints de relação retornam LISTA paginada

No OpenAPI, as sub-rotas de procedimento (`/cids/`, `/ocupacoes/`, …) aparecem como se
retornassem **um objeto**. No runtime elas retornam **lista paginada** (mesmo shape de
§5.2) cujos `results` são do schema indicado em §5.1. Trate **todas** as relações como
coleções paginadas.

### 5.4 Filtros de `/procedimentos/`

| Parâmetro | Casa com | Valor | Observação |
|---|---|---|---|
| `search` | `co_procedimento`, `no_procedimento` | texto | `icontains`; aplicar **debounce** (~350 ms) |
| `grupo` | `co_grupo` (exato) | `"02"` | 2 dígitos |
| `sub_grupo` | `co_sub_grupo` (exato) | `"06"` | 2 dígitos; só faz sentido junto de `grupo` |
| `forma_organizacao` | `co_forma_organizacao` (exato) | `"01"` | 2 dígitos; combinar com `grupo`+`sub_grupo` |
| `financiamento` | `financiamento.co_financiamento` | `"06"` | usar `/financiamentos/` como fonte de opções |
| `modalidade` | `modalidades.co_modalidade` | `"01"` | join M2M; fonte: `/modalidades/` |
| `complexidade` | `tp_complexidade` | `"0".."3"` | rótulos no Anexo C |
| `sexo` | `tp_sexo` | `"M"/"F"/"I"/"N"` | rótulos no Anexo C |
| `ordering` | — | `co_procedimento`, `no_procedimento`, `vl_sh`, `vl_sa`, `vl_sp` | prefixo `-` p/ desc |
| `page`, `page_size` | — | inteiros | `page_size ≤ 200` |
| `competencia` | — | `AAAAMM` | global |

> A hierarquia é um **filtro em cascata**: `grupo` habilita as opções de `subgrupo`
> (`GET /subgrupos/?co_grupo=02`), que habilita `forma_organizacao`
> (`GET /formas-organizacao/?co_grupo=02&co_sub_grupo=06`).

### 5.5 Tipos e formatação

- **Códigos são strings com zeros à esquerda** (`co_procedimento` "0202010473",
  `co_grupo` "02"). **Nunca** converter para número.
- **Monetário** (`vl_sh`, `vl_sa`, `vl_sp`, `vl_percentual_*`): vêm como **string
  decimal** (ex.: `"98.95"`). Formatar como BRL (`R$ 98,95`); percentual como `% `.
- **Idade** (`vl_idade_minima`, `vl_idade_maxima`): inteiro em **meses**, `null` quando
  "não se aplica". Formatar amigável (ex.: `0` → "—"; `48` → "4 anos"; `6` → "6 meses").
- **Booleans**: `st_principal` (CID principal) → badge.
- **`competencia`** no payload de lista = período consultado.

### 5.6 ⚠️ Dicionários compostos com lookup por `id`

`subgrupos`, `formas-organizacao`, `servico-classificacoes` e `sia-sih` têm detalhe por
**`id` interno**, mas o payload de lista **não expõe `id`**. Portanto, **não** construa
páginas de detalhe por `id` para eles — use as **listas com filtros** (e como fontes de
opção em selects). Os demais recursos usam a chave natural e têm detalhe navegável.

### 5.7 Erros e estados

- **404**: código inexistente na competência (ou competência fora da janela) → tela/empty
  "não encontrado".
- **Lista vazia** (`count: 0`): estado vazio dedicado (não confundir com erro).
- **Rede/5xx**: estado de erro com botão **"Tentar novamente"**.
- Sem `Authorization` e sem tratamento de 401 (API pública).

---

## 6. Stack e decisões técnicas

Decisões tomadas por julgamento de engenharia (ajustáveis); o requisito fixo do usuário é
**React + TailwindCSS**.

| Camada | Escolha | Racional / alternativa |
|---|---|---|
| Build/bundler | **Vite** | rápido, padrão moderno para SPA React |
| Linguagem | **TypeScript** (strict) | segurança de tipos; casa com tipos gerados do OpenAPI |
| UI/estilo | **TailwindCSS v3+** | requisito do usuário |
| Componentes base | **shadcn/ui** (Radix UI + Tailwind) | primitivos acessíveis e estilizáveis; alt.: Headless UI. **Não** usar MUI/AntD (não são Tailwind) |
| Ícones | **lucide-react** | leve, consistente |
| Data fetching/cache | **TanStack Query (React Query)** | cache, dedup, paginação, retries, estados de loading/erro |
| Tabelas | **TanStack Table** (headless) estilizado com Tailwind | sorting/colunas; UI sob nosso controle |
| Roteamento | **React Router v6** | padrão; URL como fonte de estado dos filtros |
| Estado de filtros/URL | `useSearchParams` (URL) + React Query | filtros compartilháveis/bookmarkáveis |
| Formulários | **React Hook Form** + **Zod** | filtros e validação leve |
| HTTP | `fetch` encapsulado (ou `axios`) | cliente fino central |
| Tipos da API | **openapi-typescript** gerando de `SIGTAP_API.yaml` | tipos sempre alinhados ao contrato (corrigir manualmente os 3 descompasses da §5) |
| Testes | **Vitest** + **React Testing Library**; **Playwright** (e2e) | unit/comp + fluxo |
| Qualidade | ESLint + Prettier | padronização |

> **Geração de tipos:** rodar `openapi-typescript docs/SIGTAP_API.yaml -o src/api/schema.d.ts`
> no setup e a cada atualização da API. Como o OpenAPI omite o `competencia` da paginação
> e modela relações como objeto único, **sobrepor** esses tipos manualmente em
> `src/api/types.ts` (paginação genérica + relações como listas).

---

## 7. Arquitetura do frontend

### 7.1 Estrutura de pastas (proposta)

```text
src/
├── api/
│   ├── client.ts            # wrapper de fetch (baseURL, query string, erros)
│   ├── schema.d.ts          # tipos gerados do OpenAPI (openapi-typescript)
│   ├── types.ts             # tipos derivados/corrigidos (Paginated<T>, relações)
│   ├── endpoints.ts         # funções por recurso (getProcedimentos, getProcedimento, ...)
│   └── queries.ts           # hooks React Query (useProcedimentos, useProcedimento, ...)
├── app/
│   ├── router.tsx           # rotas
│   ├── providers.tsx        # QueryClientProvider, Theme, Competência
│   └── layout/              # AppShell, Sidebar, Header, CompetenciaSelector
├── components/
│   ├── ui/                  # shadcn/ui (button, input, select, dialog, tabs, ...)
│   ├── data-table/          # DataTable, colunas, paginação, toolbar
│   ├── filters/             # FilterBar, CascadeHierarquia, AsyncCombobox, FilterChips
│   └── common/              # MoneyCell, IdadeCell, TpBadge, CopyCode, EmptyState, ErrorState, PageHeader
├── features/
│   ├── procedimentos/       # lista, detalhe (+ abas de relações)
│   ├── reversas/            # procedimentos por CID/CBO/serviço/modalidade/habilitação
│   └── dicionarios/         # padrão genérico de dicionário (config-driven)
├── lib/
│   ├── format.ts            # BRL, idade, datas, códigos
│   ├── labels.ts            # mapas de TP_* (Anexo C)
│   └── url.ts               # sync filtros ↔ querystring
├── hooks/                   # useCompetencia, useDebouncedValue, useUrlFilters
└── main.tsx
```

### 7.2 Camada de API (ilustrativo — não é a implementação)

```ts
// api/types.ts
export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  competencia: string | null; // §5.2
  results: T[];
}

// api/client.ts
const BASE = import.meta.env.VITE_API_BASE_URL ?? "/api/v1/sigtap";

export async function apiGet<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  const qs = params
    ? "?" + new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== "" && v != null)
          .map(([k, v]) => [k, String(v)])
      )
    : "";
  const res = await fetch(`${BASE}${path}${qs}`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new ApiError(res.status, await res.text());
  return res.json();
}

// api/queries.ts
export function useProcedimentos(filtros: ProcedimentoFiltros) {
  return useQuery({
    queryKey: ["procedimentos", filtros],
    queryFn: () => apiGet<Paginated<ProcedimentoList>>("/procedimentos/", filtros),
    placeholderData: keepPreviousData, // paginação sem "piscar"
  });
}
```

### 7.3 Competência global

Um `CompetenciaProvider` (Context) carrega `GET /competencias/`, define a vigente como
padrão, persiste a escolha em `localStorage` **e** sincroniza com `?competencia=` na URL.
Todo hook de recurso versionado injeta a competência atual nos params. Trocar a
competência **invalida** as queries (React Query) e recarrega as telas.

---

## 8. Arquitetura de navegação, rotas e layout

### 8.1 Layout (AppShell)

- **Sidebar** (colapsável) com os contextos agrupados (espelha as tags do Swagger):
  - **Procedimentos** (item de destaque, topo)
  - **Hierarquia:** Grupos · Subgrupos · Formas de Organização
  - **Dimensões:** Financiamentos · Rubricas · Modalidades · Registros · Serviços ·
    Serviços/Classificações · Tipos de Leito · Habilitações · Detalhes · SIA/SIH
  - **Dicionários:** CIDs · Ocupações (CBO) · Grupos de Habilitação · Regras
    Condicionadas · Redes de Atenção · Componentes de Rede · TUSS · RENASES
- **Header**: logo/título, **busca global** (atalho para Procedimentos com `search`),
  **CompetenciaSelector**, toggle de tema (claro/escuro).
- **Conteúdo**: breadcrumbs + `PageHeader` (título, contagem, ações) + corpo.
- **Responsivo**: sidebar vira drawer no mobile; tabelas com scroll/cartões (§10).

### 8.2 Rotas

| Rota | Tela |
|---|---|
| `/` | Home/dashboard simples (atalhos + busca + competência vigente) |
| `/procedimentos` | Lista de procedimentos (filtros + tabela) — filtros na URL |
| `/procedimentos/:co` | Detalhe do procedimento (abas de relações) |
| `/cids`, `/ocupacoes`, `/financiamentos`, … | Listas de dicionário (padrão genérico) |
| `/cids/:co`, `/ocupacoes/:co`, … | Detalhe de dicionário (quando há chave natural) |
| `/cids/:co/procedimentos` | Consulta reversa (procedimentos por CID) — idem CBO/serviço/modalidade/habilitação |
| `*` | 404 |

Estado de filtros, página, ordenação e competência **sempre na querystring** (ex.:
`/procedimentos?grupo=02&complexidade=3&ordering=-vl_sa&page=2&competencia=202605`).

---

## 9. Design system e diretrizes de UI

Objetivo: **moderno, limpo, denso o suficiente para dados, e rápido de ler**. Inspiração:
painéis tipo Linear/Vercel/Stripe — neutro, com um acento e bom contraste.

- **Cores (tokens via CSS variables / Tailwind theme):** neutros `slate`/`zinc`; **primária**
  sóbria (ex.: `indigo`/`teal`); semânticos (success/warn/danger/info) para badges. Suporte
  a **dark mode** (`darkMode: 'class'`).
- **Tipografia:** **Inter** (ou system-ui). Tabular numbers (`font-variant-numeric:
  tabular-nums`) nas colunas numéricas/monetárias para alinhamento.
- **Espaçamento/raio/sombra:** escala 4px; `rounded-lg`/`xl`; sombras suaves; bordas
  `slate-200`/`slate-800`.
- **Densidade:** tabelas com modo **confortável/compacto** (toggle).
- **Iconografia:** lucide-react, tamanho consistente (16–18px).
- **Componentização:** base shadcn/ui (Button, Input, Select, Combobox, Dialog, Sheet,
  Tabs, Tooltip, Badge, Skeleton, DropdownMenu, Toast).
- **Microinterações:** transições curtas (150–200ms), respeitando `prefers-reduced-motion`.
- **Vazio/erro/carregando:** sempre desenhados (não deixar tela em branco).

---

## 10. Componentes reutilizáveis (especificação)

### 10.1 `DataTable` (tabela de listagem moderna)

Requisitos:

- **Cabeçalho fixo** (sticky) ao rolar; **zebra** opcional; hover destacado.
- **Ordenação server-side** clicando no cabeçalho (mapeia para `ordering`; ciclo
  asc/desc/none) — só nas colunas ordenáveis suportadas pela API.
- **Paginação**: rodapé com `count`, página atual, próxima/anterior (usa `next`/`previous`),
  ir-para-página e **seletor de `page_size`** (25/50/100/200).
- **Estados**: linhas **skeleton** no carregamento; **EmptyState** quando `count: 0`;
  **ErrorState** com retry; manter dados anteriores ao paginar (`keepPreviousData`).
- **Linha clicável** → navega ao detalhe; **CopyCode** no código (clipboard + toast).
- **Colunas numéricas/monetárias** alinhadas à direita, `tabular-nums`.
- **Responsivo**: scroll horizontal com primeira coluna fixa **ou** layout em cartões no
  mobile.
- **Extras (nice-to-have)**: seletor de colunas visíveis; densidade; export CSV da página
  atual (client-side) — sinalizar que é só a página corrente.
- **Acessibilidade**: `<table>` semântica, `scope`, `aria-sort`, navegação por teclado,
  foco visível.

### 10.2 `FilterBar` + filtros

- **Barra de busca** com debounce e botão limpar.
- **Filtros avançados** em painel colapsável (ou `Sheet` no mobile).
- **CascadeHierarquia**: selects encadeados Grupo → Subgrupo → Forma de Organização
  (cada um carrega opções via API conforme o anterior; limpar o pai limpa os filhos).
- **AsyncCombobox** (busca server-side com debounce + paginação "carregar mais") para
  fontes grandes (CIDs ~14k, Ocupações ~2,7k) — nunca carregar tudo de uma vez.
- **FilterChips**: filtros ativos como chips removíveis + botão **"Limpar filtros"**.
- Estado dos filtros **espelhado na URL**.

### 10.3 Outros

- **`CompetenciaSelector`** (header): dropdown com competências (`/competencias/`), badge
  "vigente", aplica globalmente.
- **`MoneyCell`** (BRL), **`IdadeCell`** (meses→amigável), **`TpBadge`** (mapeia
  `tp_complexidade`/`tp_sexo`/`tp_procedimento`/`st_principal` para rótulo+cor — Anexo C).
- **`PageHeader`** (título, contagem, ações), **`Breadcrumbs`**, **`EmptyState`**,
  **`ErrorState`**, **`CopyCode`**, **`Section`/`KeyValue`** (para o detalhe).

---

## 11. Especificação de telas

### 11.1 Procedimentos — Lista (`/procedimentos`) — tela principal

- **FilterBar**: busca (código/nome) + cascata Grupo→Subgrupo→Forma + Financiamento +
  Modalidade + Complexidade + Sexo + chips de filtros ativos.
- **DataTable** (colunas sugeridas):
  | Coluna | Campo | Notas |
  |---|---|---|
  | Código | `co_procedimento` | mono, CopyCode |
  | Procedimento | `no_procedimento` | trunca com tooltip |
  | Compl. | `tp_complexidade` | `TpBadge` |
  | Sexo | `tp_sexo` | `TpBadge` |
  | Financ. | `financiamento` | código; tooltip com nome (via dicionário) |
  | SH | `vl_sh` | BRL, à direita, ordenável |
  | SA | `vl_sa` | BRL, à direita, ordenável |
  | SP | `vl_sp` | BRL, à direita, ordenável |
- Ordenação default `co_procedimento`. Linha → `/procedimentos/:co`.
- Cabeçalho com contagem ("4.984 procedimentos · competência 202605").

### 11.2 Procedimentos — Detalhe (`/procedimentos/:co`)

- **Cabeçalho**: código (CopyCode) + nome + badges (complexidade, sexo, competência).
- **Resumo (KeyValue)**: financiamento (nome), rubrica, hierarquia (grupo/subgrupo/forma
  com links), valores **SH/SA/SP** (cards de destaque), idade mín/máx, qtd. máxima,
  dias/tempo de permanência, pontos.
- **Descrição**: `descricao` (texto longo) em bloco colapsável.
- **Abas de relações** (lazy: busca ao abrir a aba; mostrar contagem por aba quando
  possível):
  CIDs (`st_principal`) · Ocupações (CBO) · Modalidades · Serviços/Classificações ·
  Habilitações (+ grupo) · Incrementos (percentuais) · Compatíveis (+ registros, tipo,
  qtd) · Leitos · Registros · Detalhes · SIA/SIH (A/H) · Origem · Regras Condicionadas ·
  RENASES · Redes/Componentes · TUSS.
  - Cada aba é uma `DataTable` enxuta do schema correspondente (§5.1); itens com chave
    navegável **linkam** para o dicionário (ex.: CID → `/cids/:co`) e para a reversa.
  - Abas com `count: 0` aparecem desabilitadas/silenciadas.

### 11.3 Consultas reversas

`/cids/:co/procedimentos`, `/ocupacoes/:co/procedimentos`, `/servicos/:co/procedimentos`,
`/modalidades/:co/procedimentos`, `/habilitacoes/:co/procedimentos`.

- Cabeçalho com a entidade de origem (código + nome) e a contagem.
- **DataTable** de `ProcedimentoList` (reusar a tabela de 11.1, sem os filtros de
  hierarquia), com busca/ordenação/paginação. Acessível a partir das abas do detalhe e
  das telas de dicionário.

### 11.4 Dicionários (padrão genérico, config-driven)

Um componente único parametrizado por uma config por recurso (rótulo, endpoint, colunas,
campo-chave, se tem reversa). Cobre CIDs, Ocupações, Financiamentos, Modalidades,
Registros, Serviços, Tipos de Leito, Habilitações, Detalhes, Grupos, Grupos de
Habilitação, Regras Condicionadas, Redes de Atenção, Componentes de Rede, TUSS, RENASES.

- **Lista**: busca + DataTable (Código, Nome, + colunas específicas) + paginação.
- **Detalhe** (quando há chave natural): KeyValue dos campos + atalho para a reversa
  quando existir (CIDs, Ocupações, Serviços, Modalidades, Habilitações).
- **Compostos** (Subgrupos, Formas de Organização, Serviços/Classificações, SIA/SIH):
  somente **lista com filtros** (§5.6), usados sobretudo como apoio/opções.

### 11.5 Home (`/`)

Cartões de atalho (Procedimentos, CIDs, Ocupações…), busca em destaque e indicação da
competência vigente. Simples — o foco é levar rápido às consultas.

---

## 12. Estados, performance e qualidade

- **React Query**: `staleTime` generoso para dicionários estáveis; `keepPreviousData` na
  paginação; invalidação ao trocar competência; retry com backoff em erro de rede.
- **Debounce** (~350 ms) na busca; cancelar requisições obsoletas.
- **Code splitting** por rota (lazy routes) e por aba pesada.
- **AsyncCombobox** paginado para listas grandes (CIDs/Ocupações) — nunca baixar tudo.
- **Skeletons** em vez de spinners onde possível; sem layout shift.
- **URL como estado** → voltar/avançar do navegador e refresh preservam a consulta.
- **Acessibilidade** (§13) e **i18n pt-BR** (formatadores `Intl` para moeda/número/data).

---

## 13. Requisitos não-funcionais

- **Acessibilidade**: WCAG 2.1 AA — contraste, foco visível, navegação por teclado, ARIA
  em tabelas/diálogos, `prefers-reduced-motion`.
- **Responsividade**: 360px → desktop largo; tabelas adaptadas (scroll/cartões).
- **Performance** (alvo): TTI < 3s em 3G rápido; busca/paginação percebida < 300ms com
  cache; bundle inicial enxuto (lazy).
- **Navegadores**: últimas 2 versões de Chrome, Edge, Firefox, Safari.
- **Premissa de auth (futuro):** se a API voltar a exigir login, o `apiClient` deve ter um
  ponto único para injetar `Authorization: Bearer` e tratar 401 (refresh/redirect). Hoje
  **não** é necessário (API pública).

---

## 14. Roadmap por fases

1. **Fundação**: Vite+TS+Tailwind+shadcn, AppShell (sidebar/header), tema, `apiClient`,
   tipos do OpenAPI, React Query, CompetenciaProvider, formatadores e labels.
2. **Componentes núcleo**: `DataTable` (sorting/paginação/estados) e `FilterBar`
   (busca/cascata/chips/URL).
3. **Procedimentos**: lista com filtros + detalhe com 2–3 abas (CIDs, Ocupações,
   Compatíveis).
4. **Relações restantes** do procedimento (demais abas) + **consultas reversas**.
5. **Dicionários** (padrão genérico) para todos os recursos.
6. **Polimento**: dark mode, acessibilidade, skeletons, export CSV, densidade, testes
   (unit/e2e), performance.

---

## 15. Critérios de aceitação

- **AC-01:** É possível buscar, filtrar (hierarquia em cascata + financiamento/modalidade/
  complexidade/sexo), ordenar e paginar procedimentos; o estado vai para a URL e é
  restaurado ao recarregar/compartilhar.
- **AC-02:** O detalhe do procedimento mostra atributos + valores SH/SA/SP formatados em
  BRL + descrição, e as relações nas abas carregam sob demanda como **listas paginadas**
  (conforme §5.3).
- **AC-03:** As 5 consultas reversas (CID, CBO, serviço, modalidade, habilitação) listam
  procedimentos corretamente.
- **AC-04:** O `CompetenciaSelector` troca a competência globalmente (default = vigente),
  reflete em `?competencia=` e recarrega os dados.
- **AC-05:** Todos os dicionários têm lista com busca/paginação; os de chave natural têm
  detalhe; os compostos (§5.6) funcionam como listas com filtros.
- **AC-06:** Códigos preservam zeros à esquerda; moeda/idade formatados em pt-BR; `TP_*`
  exibidos com rótulos legíveis (Anexo C).
- **AC-07:** Estados de carregando/vazio/erro tratados em todas as telas; UI responsiva e
  acessível (teclado + contraste); dark mode funcional.
- **AC-08:** Nenhuma chamada de escrita; nenhuma dependência de autenticação para
  consultar.

---

## 16. Anexos

### Anexo A — Mapa endpoint → tela

| Tela | Endpoint(s) |
|---|---|
| Lista de procedimentos | `GET /procedimentos/` (+ filtros) |
| Detalhe + abas | `GET /procedimentos/{co}/` e `…/{co}/<relação>/` |
| Reversas | `GET /{cids,ocupacoes,servicos,modalidades,habilitacoes}/{co}/procedimentos/` |
| Opções de filtro (cascata) | `GET /grupos/`, `/subgrupos/?co_grupo=`, `/formas-organizacao/?co_grupo=&co_sub_grupo=` |
| Opções de filtro (dimensões) | `GET /financiamentos/`, `/modalidades/` |
| Dicionários | `GET /<recurso>/` e `GET /<recurso>/{chave}/` |
| Competência global | `GET /competencias/` |

### Anexo B — Exemplos de payload (runtime)

```jsonc
// GET /api/v1/sigtap/procedimentos/?grupo=02&complexidade=3&ordering=-vl_sa&page=1
{
  "count": 37, "next": "...", "previous": null, "competencia": "202605",
  "results": [
    { "co_procedimento": "0206010079", "no_procedimento": "TOMOGRAFIA ...",
      "tp_complexidade": "3", "tp_sexo": "I",
      "co_grupo": "02", "co_sub_grupo": "06", "co_forma_organizacao": "01",
      "financiamento": "06", "vl_sh": "0.00", "vl_sa": "98.95", "vl_sp": "0.00",
      "competencia": "202605" }
  ]
}

// GET /api/v1/sigtap/procedimentos/0202010473/cids/   (LISTA — §5.3)
{
  "count": 12, "next": null, "previous": null, "competencia": "202605",
  "results": [
    { "cid": { "co_cid": "C73", "no_cid": "Neoplasia maligna da glândula tireóide",
               "tp_agravo": "0", "tp_sexo": "I", "tp_estadio": "0",
               "vl_campos_irradiados": null },
      "st_principal": true }
  ]
}
```

### Anexo C — Rótulos dos códigos de domínio (`TP_*`)

> ⚠️ Estes significados **não vêm da API** (ver prd-sigtap.md §10). São convenções de
> domínio do SIGTAP — **centralizar em `lib/labels.ts`** e validar/ajustar com a área de
> negócio. Códigos não mapeados devem exibir o valor cru com tooltip "a confirmar".

```ts
export const TP_COMPLEXIDADE = {
  "0": "Não se aplica",
  "1": "Atenção Básica",
  "2": "Média Complexidade",
  "3": "Alta Complexidade",
} as const;

export const TP_SEXO = {
  "M": "Masculino", "F": "Feminino",
  "I": "Ambos/Indiferente", "N": "Não se aplica",
} as const;

export const TP_PROCEDIMENTO_SIA_SIH = { "A": "Ambulatorial", "H": "Hospitalar" } as const;

// st_principal: true → "CID principal" | false → "CID secundário"
// tp_compatibilidade ("1".."5") e tp_agravo ("0"/"2"): significados não documentados →
//   exibir código + tooltip "a confirmar".
```

### Anexo D — Variáveis de ambiente do frontend

| Variável | Exemplo | Uso |
|---|---|---|
| `VITE_API_BASE_URL` | `https://api.seu-dominio/api/v1/sigtap` | base da API (dev: proxy p/ `http://localhost:8000`) |

---

> **Resumo para a IA implementadora:** SPA React+TS+Tailwind (shadcn/ui, React Query,
> TanStack Table, React Router), consumindo a API **pública somente-leitura**
> `/api/v1/sigtap/`. Centro de tudo: **lista + detalhe de procedimento** com filtros em
> cascata e abas de relação. **Atenção aos 3 descompasses do OpenAPI** (§5.2 paginação com
> `competencia`; §5.3 relações são listas paginadas; §5.6 dicionários compostos por `id`).
> Estado de consulta na URL; competência global; formatação pt-BR; acessível e responsivo.
