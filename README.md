# SIGTAP — Frontend

SPA em **React 18 + TypeScript + TailwindCSS** para consulta à Tabela Unificada do SUS (SIGTAP), consumindo uma API REST pública e somente-leitura.

## ✨ Stack

| Camada | Tecnologia |
|---|---|
| Build | Vite 5 |
| Linguagem | TypeScript (strict) |
| UI | TailwindCSS 3 + Radix UI (estilo shadcn/ui) |
| Ícones | lucide-react |
| Dados/Cache | TanStack Query v5 |
| Tabelas | TanStack Table v8 (headless) |
| Rotas | React Router v6 |
| Toasts | Sonner |

## 🚀 Começando

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env      # ajuste VITE_API_BASE_URL se necessário

# Iniciar servidor de desenvolvimento
npm run dev               # http://localhost:5173
```

### Scripts disponíveis

| Script | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (Vite) |
| `npm run build` | Typecheck + build de produção (`dist/`) |
| `npm run preview` | Serve o build de produção localmente |
| `npm run lint` | Linting com ESLint |
| `npm run typecheck` | Verificação de tipos (sem emitir) |

### Variáveis de ambiente

| Variável | Exemplo | Descrição |
|---|---|---|
| `VITE_API_BASE_URL` | `https://api.exemplo/api/v1/sigtap` | URL base da API |
| `VITE_DEV_API_PROXY` | `http://localhost:8000` | Alvo do proxy em desenvolvimento |

> Em desenvolvimento, `VITE_API_BASE_URL=/api/v1/sigtap` usa o proxy do Vite que encaminha `/api` para `VITE_DEV_API_PROXY` (default `http://localhost:8000`). Em produção, aponte `VITE_API_BASE_URL` para a URL absoluta da API.

## 📁 Estrutura do projeto

```
src/
├── api/           # Client (fetch), types, endpoints e queries (React Query)
├── app/           # Providers, router e layout (shell, sidebar, header)
├── components/    # ui/ (primitivos), data-table/, filters/, common/
├── features/      # Módulos de funcionalidade (procedimentos, reversas, dicionários, home)
├── hooks/         # Hooks customizados (useCompetencia, useTheme, useDebouncedValue, etc.)
└── lib/           # Utilitários de formatação, labels, URL e helpers
```

## 🏗️ Funcionalidades principais

- **Estado de consulta na URL** — filtros, paginação e ordenação são compartilháveis e sobrevivem a refresh/navegação.
- **Competência global** — default = vigente, persistida em `localStorage` e sincronizada com a URL. Trocar a competência recarrega automaticamente os dados.
- **Dicionários config-driven** — um único par de componentes cobre todos os recursos de dicionário via registro centralizado.
- **Detalhe de procedimento** — 16 abas de relação carregadas sob demanda, com badges de contagem e abas vazias desabilitadas.
- **Tema claro/escuro** — toggle com persistência em `localStorage` (padrão: tema claro).
- **Acessibilidade** — tabelas semânticas, foco visível, navegação por teclado e suporte a `prefers-reduced-motion`.

## 📝 Notas

- A API é **pública e somente-leitura** — nenhuma chamada de escrita ou header de autenticação.
- Códigos preservam zeros à esquerda (strings); moeda e idade são formatadas em pt-BR via `Intl`.
- Os tipos da API são mantidos manualmente em `src/api/types.ts`.
