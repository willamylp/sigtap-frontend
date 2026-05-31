import { useCallback, useEffect, useMemo, useState } from "react";
import { SidebarContext } from "@/app/sidebar-context";

const STORAGE_KEY = "sigtap-sidebar-collapsed";

function getInitialCollapsed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

/**
 * Mantém a preferência de recolhimento da sidebar (persistida em localStorage,
 * mesmo padrão do tema). `collapsed` reflete a escolha do usuário; `hovered` é o
 * hover temporário que expande sem mudar a preferência. Ambos ficam no contexto
 * para que a Sidebar e o cabeçalho da logo expandam/recolham em conjunto.
 */
export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsedState] = useState(getInitialCollapsed);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed));
    } catch {
      /* ignore (modo privado etc.) */
    }
  }, [collapsed]);

  const setCollapsed = useCallback((next: boolean) => setCollapsedState(next), []);
  const toggleCollapsed = useCallback(() => {
    // Recolher/expandir manualmente zera o hover, refletindo na hora.
    setHovered(false);
    setCollapsedState((c) => !c);
  }, []);

  const expanded = !collapsed || hovered;

  const value = useMemo(
    () => ({
      collapsed,
      setCollapsed,
      toggleCollapsed,
      hovered,
      setHovered,
      expanded,
    }),
    [collapsed, setCollapsed, toggleCollapsed, hovered, expanded]
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}
