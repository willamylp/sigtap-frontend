import {
  Activity,
  BadgeCheck,
  Banknote,
  BarChart3,
  BedDouble,
  BookText,
  Boxes,
  Briefcase,
  Cable,
  ClipboardList,
  ConciergeBell,
  FileSpreadsheet,
  FolderTree,
  GitBranch,
  Hash,
  Home,
  Info,
  Layers,
  Library,
  ListTree,
  Network,
  Shapes,
  Stethoscope,
  Tags,
  Users,
  Waypoints,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { DICTIONARIES, type DicGroup } from "@/features/dicionarios/registry";
import { RELATORIOS, relatorioPath } from "@/features/relatorios/registry";

/** Link folha da navegação. */
export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

/** Agrupamento interno de um menu (ex.: Relatórios → Relacionamentos). */
export interface NavSubgroup {
  title: string;
  items: NavItem[];
}

/**
 * Menu principal da sidebar. Pode ser:
 *  - uma **folha** (só `to`, sem filhos) — ex.: Página inicial, Procedimentos; ou
 *  - um **grupo recolhível** com `items` e/ou `subgroups`.
 */
export interface NavMenu {
  title: string;
  icon: LucideIcon;
  /** Rota direta (menu folha, sem submenus). */
  to?: string;
  /** Casamento exato da rota (para "/"). */
  end?: boolean;
  /** Submenus diretos. */
  items?: NavItem[];
  /** Subgrupos rotulados (ex.: Relacionamentos). */
  subgroups?: NavSubgroup[];
}

const GROUP_TITLES: Record<DicGroup, string> = {
  hierarquia: "Hierarquia",
  dimensoes: "Dimensões",
  dicionarios: "Dicionários",
};

/** Ícone de cada menu principal recolhível. */
const GROUP_ICONS: Record<DicGroup, LucideIcon> = {
  hierarquia: FolderTree,
  dimensoes: Shapes,
  dicionarios: Library,
};

/** Ícone por recurso, indexado pela chave de rota (registry.key). */
const RESOURCE_ICONS: Record<string, LucideIcon> = {
  procedimentos: Activity,
  // Hierarquia
  grupos: Layers,
  subgrupos: Boxes,
  "formas-organizacao": Network,
  // Dimensões
  financiamentos: Banknote,
  rubricas: Tags,
  modalidades: Workflow,
  registros: ClipboardList,
  servicos: ConciergeBell,
  "servico-classificacoes": ListTree,
  "tipos-leito": BedDouble,
  habilitacoes: BadgeCheck,
  detalhes: Info,
  "sia-sih": FileSpreadsheet,
  // Dicionários
  cids: Stethoscope,
  ocupacoes: Briefcase,
  "grupos-habilitacao": Users,
  "regras-condicionadas": GitBranch,
  "redes-atencao": Waypoints,
  "componentes-rede": Cable,
  tuss: Hash,
  renases: BookText,
};

/** Ícone de um recurso, com fallback neutro. */
export function iconFor(key: string): LucideIcon {
  return RESOURCE_ICONS[key] ?? Layers;
}

/** Menu recolhível a partir de um grupo de dicionários/dimensões. */
function menuForGroup(group: DicGroup): NavMenu {
  return {
    title: GROUP_TITLES[group],
    icon: GROUP_ICONS[group],
    items: DICTIONARIES.filter((d) => d.group === group).map((d) => ({
      label: d.label,
      to: `/${d.key}`,
      icon: iconFor(d.key),
    })),
  };
}

/**
 * Menus principais da sidebar, na ordem de exibição. Folhas (Página inicial,
 * Procedimentos) navegam direto; os demais recolhem/expandem seus submenus.
 */
export const NAV_MENUS: NavMenu[] = [
  { title: "Página inicial", icon: Home, to: "/", end: true },
  { title: "Procedimentos", icon: Activity, to: "/procedimentos" },
  {
    title: "Relatórios",
    icon: BarChart3,
    subgroups: [
      {
        title: "Relacionamentos",
        items: RELATORIOS.map((r) => ({
          label: r.titulo,
          to: relatorioPath(r.slug),
          icon: r.icon,
        })),
      },
    ],
  },
  menuForGroup("hierarquia"),
  menuForGroup("dimensoes"),
  menuForGroup("dicionarios"),
];

/** Casa um caminho contra uma rota (prefixo por segmento; exato se `end`). */
export function pathMatches(pathname: string, to: string, end = false): boolean {
  if (end) return pathname === to;
  if (pathname === to) return true;
  const base = to.endsWith("/") ? to : `${to}/`;
  return pathname.startsWith(base);
}

/** Título do menu que contém a rota ativa (para expandir/realçar). */
export function findActiveMenuTitle(pathname: string): string | undefined {
  for (const menu of NAV_MENUS) {
    if (menu.to && pathMatches(pathname, menu.to, menu.end)) return menu.title;
    if (menu.items?.some((it) => pathMatches(pathname, it.to))) return menu.title;
    if (
      menu.subgroups?.some((sg) =>
        sg.items.some((it) => pathMatches(pathname, it.to))
      )
    )
      return menu.title;
  }
  return undefined;
}
