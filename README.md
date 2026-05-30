# SIGTAP — Frontend de consulta

SPA em **React + TypeScript + TailwindCSS** para consultar a Tabela Unificada do
SIGTAP, consumindo a API REST pública (somente-leitura) `/api/v1/sigtap/`.

Implementação do PRD [`docs/prd-frontend-sigtap.md`](docs/prd-frontend-sigtap.md).
A fonte da verdade do contrato é [`docs/SIGTAP_API.yaml`](docs/SIGTAP_API.yaml).

## Stack

| Camada | Escolha |
|---|---|
| Build | Vite 5 |
| Linguagem | TypeScript (strict) |
| UI | TailwindCSS 3 + componentes estilo shadcn/ui (Radix UI) |
| Ícones | lucide-react |
| Dados/cache | TanStack Query (React Query) |
| Tabelas | TanStack Table (headless) |
| Rotas | React Router v6 (estado de consulta na URL) |
| Toasts | sonner |

## Começando

```bash
npm install
cp .env.example .env      # ajuste VITE_API_BASE_URL se necessário
npm run dev               # http://localhost:5173
```

Em desenvolvimento, `VITE_API_BASE_URL=/api/v1/sigtap` usa o proxy do Vite que
encaminha `/api` para `VITE_DEV_API_PROXY` (default `http://localhost:8000`).
Em produção, aponte `VITE_API_BASE_URL` para a URL absoluta da API.

### Scripts

| Script | Ação |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | typecheck (`tsc -b`) + build de produção (`dist/`) |
| `npm run preview` | serve o build de produção |
| `npm run typecheck` | apenas verificação de tipos |

### Variáveis de ambiente

| Variável | Exemplo | Uso |
|---|---|---|
| `VITE_API_BASE_URL` | `https://api.exemplo/api/v1/sigtap` | base da API |
| `VITE_DEV_API_PROXY` | `http://localhost:8000` | alvo do proxy em dev |

## Arquitetura

```
src/
├── api/         client (fetch), types (corrigidos), endpoints, queries (React Query)
├── app/         providers (Query/Theme/Competência), router, layout (shell/sidebar/header)
├── components/  ui/ (primitivos), data-table/, filters/, common/
├── features/    procedimentos/ (lista, detalhe + 16 abas), reversas/, dicionarios/ (config-driven), home/
├── hooks/       useCompetencia, useTheme, useDebouncedValue, useListUrlState
└── lib/         format (BRL/idade/competência), labels (TP_* — Anexo C), url, utils
```

Pontos de destaque:

- **Estado de consulta na URL** (`useSearchParams`) → filtros/página/ordenação são
  compartilháveis e sobrevivem a refresh/voltar.
- **Competência global** (`CompetenciaProvider`): default = vigente, persistida em
  `localStorage` e sincronizada com `?competencia=`. Recursos versionados injetam a
  competência na queryKey, então trocá-la recarrega tudo.
- **Dicionários config-driven**: um único par `DictionaryList`/`DictionaryDetail`
  cobre todos os recursos via [`features/dicionarios/registry.ts`](src/features/dicionarios/registry.ts).
- **Detalhe do procedimento**: 16 abas de relação carregadas **sob demanda**; badges de
  contagem por aba e abas vazias desabilitadas.

## Tratamento dos 3 descompasses do OpenAPI (PRD §5)

O OpenAPI gerado diverge do runtime em três pontos; os tipos em
[`src/api/types.ts`](src/api/types.ts) seguem o **comportamento real**:

1. **§5.2** Toda lista paginada inclui `competencia` (ausente no YAML) → `Paginated<T>`.
2. **§5.3** As sub-rotas de procedimento (`/cids/`, `/ocupacoes/`, …) retornam **lista
   paginada**, não objeto único.
3. **§5.6** Dicionários compostos (`subgrupos`, `formas-organizacao`,
   `servico-classificacoes`, `sia-sih`) não expõem `id` na lista → **sem página de
   detalhe**, apenas lista com filtros.

## Notas

- A API é **pública e somente-leitura**: nenhuma chamada de escrita, nenhum header
  `Authorization`. O ponto único para futura autenticação é
  [`src/api/client.ts`](src/api/client.ts) (PRD §13).
- Códigos preservam zeros à esquerda (strings); moeda/idade formatadas em pt-BR via `Intl`.
- Acessibilidade: tabelas semânticas (`scope`/`aria-sort`), foco visível, navegação por
  teclado, dark mode e `prefers-reduced-motion`.

> Testes automatizados (Vitest/RTL/Playwright) e geração de tipos via
> `openapi-typescript` estão previstos no PRD (fase 6) e ainda não foram adicionados —
> os tipos da API hoje são mantidos à mão em `src/api/types.ts` (com as 3 correções).
