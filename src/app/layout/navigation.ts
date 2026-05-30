import {
  Activity,
  BadgeCheck,
  Banknote,
  BedDouble,
  BookText,
  Boxes,
  Briefcase,
  Cable,
  ClipboardList,
  ConciergeBell,
  FileSpreadsheet,
  GitBranch,
  Hash,
  Info,
  Layers,
  ListTree,
  Network,
  Stethoscope,
  Tags,
  Users,
  Waypoints,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { DICTIONARIES, type DicGroup } from "@/features/dicionarios/registry";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

const GROUP_TITLES: Record<DicGroup, string> = {
  hierarquia: "Hierarquia",
  dimensoes: "Dimensões",
  dicionarios: "Dicionários",
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

function sectionFor(group: DicGroup): NavSection {
  return {
    title: GROUP_TITLES[group],
    items: DICTIONARIES.filter((d) => d.group === group).map((d) => ({
      label: d.label,
      to: `/${d.key}`,
      icon: iconFor(d.key),
    })),
  };
}

/** Item de destaque no topo da sidebar. */
export const PRIMARY_NAV: NavItem = {
  label: "Procedimentos",
  to: "/procedimentos",
  icon: RESOURCE_ICONS.procedimentos,
};

/** Seções agrupadas (espelham as tags do Swagger — PRD §8.1). */
export const NAV_SECTIONS: NavSection[] = [
  sectionFor("hierarquia"),
  sectionFor("dimensoes"),
  sectionFor("dicionarios"),
];
