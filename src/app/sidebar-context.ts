import { createContext } from "react";

export interface SidebarContextValue {
  /** Preferência do usuário: sidebar recolhida (só ícones) ou expandida. */
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
  /** Hover temporário sobre a sidebar recolhida (expande sem mudar a preferência). */
  hovered: boolean;
  setHovered: (hovered: boolean) => void;
  /** Largura efetiva: expandida quando não recolhida OU em hover. */
  expanded: boolean;
}

export const SidebarContext = createContext<SidebarContextValue | undefined>(
  undefined
);
