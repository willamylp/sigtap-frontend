import { createContext } from "react";

export interface SidebarContextValue {
  /** Preferência do usuário: sidebar recolhida (só ícones) ou expandida. */
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
}

export const SidebarContext = createContext<SidebarContextValue | undefined>(
  undefined
);
