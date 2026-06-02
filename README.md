<div align="center">

# 💻 SIGTAP Frontend

**SPA de consulta à Tabela Unificada de Procedimentos do SUS**

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![React Router](https://img.shields.io/badge/React_Router-6-CA4245?logo=reactrouter&logoColor=white)](https://reactrouter.com/)

<p>
  <a href="#-começando">Começando</a> •
  <a href="#-scripts-disponíveis">Scripts</a> •
  <a href="#-estrutura-do-projeto">Estrutura</a> •
  <a href="#%EF%B8%8F-funcionalidades">Funcionalidades</a>
</p>

</div>

---

## 📋 Sobre o Projeto

O **SIGTAP Frontend** é uma Single Page Application que consome a [API REST do SIGTAP](https://github.com/willamylp/sigtap-api) para consultar procedimentos, dicionários e dimensões da Tabela Unificada do SUS, com filtros avançados, paginação e versionamento por competência.

---

## 🛠️ Stack Tecnológica

<div align="center">

[![Tech Stack](https://skillicons.dev/icons?i=react,ts,vite,tailwind&theme=dark)](https://skillicons.dev)

</div>

| Camada | Tecnologia |
|---|---|
| **Build** | Vite 5 |
| **Linguagem** | TypeScript (strict) |
| **UI** | TailwindCSS 3 + Radix UI (estilo shadcn/ui) |
| **Ícones** | lucide-react |
| **Dados/Cache** | TanStack Query v5 (React Query) |
| **Tabelas** | TanStack Table v8 (headless) |
| **Rotas** | React Router v6 |
| **Toasts** | Sonner |
| **Deploy** | Vercel |

---

## 🚀 Começando

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone https://github.com/willamylp/sigtap-frontend.git
cd sigtap-frontend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env      # ajuste VITE_API_BASE_URL se necessário

# Inicie o servidor de desenvolvimento
npm run dev               # http://localhost:5173
```

---

## 📜 Scripts disponíveis

| Script | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (Vite) |
| `npm run build` | Typecheck + build de produção (`dist/`) |
| `npm run preview` | Serve o build de produção localmente |
| `npm run lint` | Linting com ESLint |
| `npm run typecheck` | Verificação de tipos (sem emitir) |

---

## ⚙️ Variáveis de ambiente

| Variável | Exemplo | Descrição |
|---|---|---|
| `VITE_API_BASE_URL` | `https://api.exemplo/api/v1/sigtap` | URL base da API |
| `VITE_DEV_API_PROXY` | `http://localhost:8000` | Alvo do proxy em desenvolvimento |

> 💡 Em desenvolvimento, `VITE_API_BASE_URL=/api/v1/sigtap` usa o proxy do Vite que encaminha `/api` para `VITE_DEV_API_PROXY` (default `http://localhost:8000`). Em produção, aponte `VITE_API_BASE_URL` para a URL absoluta da API.

---

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

---

## 🏗️ Funcionalidades

- 🔗 **Estado de consulta na URL** — filtros, paginação e ordenação são compartilháveis e sobrevivem a refresh/navegação
- 📅 **Competência global** — default = vigente, persistida em `localStorage` e sincronizada com a URL. Trocar a competência recarrega automaticamente os dados
- 📚 **Dicionários config-driven** — um único par de componentes cobre todos os recursos de dicionário via registro centralizado
- 📋 **Detalhe de procedimento** — 16 abas de relação carregadas sob demanda, com badges de contagem e abas vazias desabilitadas
- 🌗 **Tema claro/escuro** — toggle com persistência em `localStorage` (padrão: tema claro)
- ♿ **Acessibilidade** — tabelas semânticas, foco visível, navegação por teclado e suporte a `prefers-reduced-motion`

---

## 📝 Notas

- A API é **pública e somente-leitura** — nenhuma chamada de escrita ou header de autenticação
- Códigos preservam zeros à esquerda (strings); moeda e idade são formatadas em pt-BR via `Intl`
- Os tipos da API são mantidos manualmente em `src/api/types.ts`

---

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/minha-feature`)
3. Commit suas alterações (`git commit -m 'feat: adiciona minha feature'`)
4. Push para a branch (`git push origin feature/minha-feature`)
5. Abra um Pull Request

---

<div align="center">

Desenvolvido com ❤️ para o ecossistema de saúde pública do Brasil 🇧🇷

</div>
