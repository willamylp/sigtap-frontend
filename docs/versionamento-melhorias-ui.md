# Versionamento — Melhorias de UI e Relatórios de Relacionamentos

> Guia para **executar manualmente** os commits desta rodada de trabalho.
> Cada arquivo aparece em **exatamente um commit**. A ordem é por dependência
> (fundações → features → layout → rodapé → ajustes), então o histórico fica
> coerente e cada commit constrói sobre o anterior.
>
> Convenção do repositório (ver `git log`): prefixo capitalizado `Tipo: ...` e
> **sem acentos** na linha de assunto (`-m`), para evitar problemas de
> codificação no terminal do Windows.

---

## Resumo do que foi desenvolvido

1. **Relatórios → Relacionamentos** — nova seção config-driven (8 relatórios,
   sentido direto/reverso, exportação) + 3 atalhos na Home.
2. **Componente `Segmented`** compartilhado + slot `toolbarStart` na `DataTable`.
3. **Dicionários** — busca inline na toolbar (mesma linha dos botões de
   exportação), filtro **Tipo (A/H)** do SIA/SIH como toggle, e filtros de
   Subgrupos / Formas de Organização / Serviços-Classificações como **Selects em
   cascata** ocupando toda a largura.
4. **Sidebar** — menus principais recolhíveis com transição suave; modo
   "só-ícones" com expansão ao passar o mouse e **preferência persistida** em
   `localStorage` (padrão do tema).
5. **Rodapé** discreto com versão e crédito do desenvolvedor.
6. Ajustes visuais menores em `ProcedimentoFilters` e na busca da `ReversaPage`.

**Inventário (20 arquivos):** 8 novos, 12 modificados.

---

## Pré-requisitos

```powershell
# Confirme que esta no diretorio do projeto e na branch main
git rev-parse --abbrev-ref HEAD     # deve imprimir: main
git status --short                  # confira a lista abaixo
```

> **Opcional — PRD da feature.** Se `docs/prd-relatorios-relacionamentos-sigtap.md`
> ainda estiver como `??` (nao rastreado), comite-o antes de tudo:
> ```powershell
> git add docs/prd-relatorios-relacionamentos-sigtap.md
> git commit -m "Docs: adiciona PRD dos relatorios de relacionamentos"
> ```

---

## Commit 1 — UI base: `Segmented` + slot de filtro na toolbar

Fundação reutilizada pelos commits seguintes. Extrai o alternador `Segmented`
(antes embutido nos relatórios) para `components/filters` e adiciona o slot
`toolbarStart` na `DataTable` (renderiza algo antes da busca, na linha dos
botões de exportação).

```powershell
git add src/components/filters/Segmented.tsx `
        src/components/data-table/DataTable.tsx
git commit -m "Feat: adiciona Segmented compartilhado e slot toolbarStart na DataTable"
```

---

## Commit 2 — Relatórios de Relacionamentos (seção nova)

Tela única config-driven, registry dos 8 relatórios, rotas com lazy/code-split
e os 3 atalhos na Home. Usa o `Segmented` do Commit 1.

```powershell
git add src/features/relatorios/registry.tsx `
        src/features/relatorios/RelatorioRelacionamento.tsx `
        src/app/router.tsx `
        src/features/home/HomePage.tsx
git commit -m "Feat: adiciona secao Relatorios de Relacionamentos (config-driven, rotas e atalhos)"
```

---

## Commit 3 — Filtros dos dicionários

Busca inline na toolbar (exceto telas com cascata), Tipo (A/H) do SIA/SIH como
toggle e os filtros de cascata como Selects carregados da API, em largura total.
Inclui o novo `DictionaryFilters` e os ajustes de config no `registry.ts`.

```powershell
git add src/features/dicionarios/DictionaryFilters.tsx `
        src/features/dicionarios/DictionaryList.tsx `
        src/features/dicionarios/registry.ts
git commit -m "Feat: melhora filtros dos dicionarios (busca inline, Tipo A/H em toggle e selects em cascata)"
```

---

## Commit 4 — Reformulação da sidebar

Menus principais recolhíveis com transição, modo só-ícones com hover, botão de
recolher/expandir e preferência persistida (context + provider + hook, no padrão
do tema). Ajusta o `Header` (largura/logo) e registra o provider.

```powershell
git add src/app/sidebar-context.ts `
        src/app/providers/SidebarProvider.tsx `
        src/hooks/useSidebar.ts `
        src/app/providers.tsx `
        src/app/layout/navigation.ts `
        src/app/layout/Sidebar.tsx `
        src/app/layout/Header.tsx
git commit -m "Feat: reformula sidebar com menus recolhiveis e preferencia persistida"
```

---

## Commit 5 — Rodapé do conteúdo

Rodapé discreto com versão (`v1.0.0-prd`) e crédito ("Desenvolvido por:
Willamy" → link em nova guia), com `APP_INFO` centralizado. Renderizado no
`AppShell`.

```powershell
git add src/app/layout/Footer.tsx `
        src/app/layout/AppShell.tsx
git commit -m "Feat: adiciona rodape com versao e credito do desenvolvedor"
```

---

## Commit 6 — Ajustes visuais menores

Refinos de estilo em `ProcedimentoFilters` (badge de contagem) e largura da
busca da `ReversaPage`.

```powershell
git add src/features/procedimentos/ProcedimentoFilters.tsx `
        src/features/reversas/ReversaPage.tsx
git commit -m "Style: ajustes visuais em ProcedimentoFilters e busca da ReversaPage"
```

---

## Verificação e push

```powershell
git status --short          # deve estar limpo (fora docs opcionais)
npm run typecheck           # exit 0
npm run build               # exit 0
git log --oneline -7        # confira a sequencia
git push                    # ou: git push -u origin main (se ainda nao houver upstream)
```

---

## Mapa arquivo → commit (referência)

| Arquivo | Commit | Estado |
|---|---|---|
| `src/components/filters/Segmented.tsx` | 1 | novo |
| `src/components/data-table/DataTable.tsx` | 1 | mod |
| `src/features/relatorios/registry.tsx` | 2 | novo |
| `src/features/relatorios/RelatorioRelacionamento.tsx` | 2 | novo |
| `src/app/router.tsx` | 2 | mod |
| `src/features/home/HomePage.tsx` | 2 | mod |
| `src/features/dicionarios/DictionaryFilters.tsx` | 3 | novo |
| `src/features/dicionarios/DictionaryList.tsx` | 3 | mod |
| `src/features/dicionarios/registry.ts` | 3 | mod |
| `src/app/sidebar-context.ts` | 4 | novo |
| `src/app/providers/SidebarProvider.tsx` | 4 | novo |
| `src/hooks/useSidebar.ts` | 4 | novo |
| `src/app/providers.tsx` | 4 | mod |
| `src/app/layout/navigation.ts` | 4 | mod |
| `src/app/layout/Sidebar.tsx` | 4 | mod |
| `src/app/layout/Header.tsx` | 4 | mod |
| `src/app/layout/Footer.tsx` | 5 | novo |
| `src/app/layout/AppShell.tsx` | 5 | mod |
| `src/features/procedimentos/ProcedimentoFilters.tsx` | 6 | mod |
| `src/features/reversas/ReversaPage.tsx` | 6 | mod |

> **Nota sobre granularidade.** Os commits são por **arquivo inteiro** (estado
> final), o que é o mais simples de executar manualmente. Alguns arquivos
> (`Sidebar.tsx`, `navigation.ts`) evoluíram em mais de uma etapa ao longo da
> sessão; aqui são entregues no commit que representa sua forma final. Se quiser
> separar mudanças dentro de um mesmo arquivo, use `git add -p <arquivo>`.
