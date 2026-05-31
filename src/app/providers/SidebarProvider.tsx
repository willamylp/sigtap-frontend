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
 * mesmo padrão do tema). `collapsed` reflete a escolha do usuário; o hover que
 * expande temporariamente é estado local da própria Sidebar.
 */
export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsedState] = useState(getInitialCollapsed);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed));
    } catch {
      /* ignore (modo privado etc.) */
    }
  }, [collapsed]);

  const setCollapsed = useCallback((next: boolean) => setCollapsedState(next), []);
  const toggleCollapsed = useCallback(
    () => setCollapsedState((c) => !c),
    []
  );

  const value = useMemo(
    () => ({ collapsed, setCollapsed, toggleCollapsed }),
    [collapsed, setCollapsed, toggleCollapsed]
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}
