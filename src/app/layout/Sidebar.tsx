import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/useSidebar";
import { SimpleTooltip } from "@/components/ui/tooltip";
import {
  NAV_MENUS,
  findActiveMenuTitle,
  type NavItem,
  type NavMenu,
} from "./navigation";

/** Cabeçalho de um menu principal (folha ou grupo recolhível). */
function menuHeaderClasses(active: boolean, strong: boolean) {
  return cn(
    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
    active
      ? strong
        ? "bg-blue-800 text-white"
        : "bg-blue-800/40 text-white"
      : "text-white/80 hover:bg-blue-800/40 hover:text-sidebar-accent-foreground"
  );
}

/** Estilo de um submenu (link folha dentro de um menu principal). */
function itemClasses(isActive: boolean) {
  return cn(
    "flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
    isActive
      ? "bg-blue-800 font-medium text-white"
      : "text-sidebar-foreground hover:bg-sky-600 hover:text-sidebar-accent-foreground transition-all duration-200 ease-in-out"
  );
}

/** Lista de submenus (reutilizada por itens diretos e subgrupos). */
function NavItemList({
  items,
  onNavigate,
}: {
  items: NavItem[];
  onNavigate?: () => void;
}) {
  return (
    <ul className="space-y-0.5">
      {items.map((item) => (
        <li key={item.to}>
          <NavLink
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) => itemClasses(isActive)}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

/** Menu principal recolhível com seus submenus. */
function CollapsibleMenu({
  menu,
  active,
  onNavigate,
}: {
  menu: NavMenu;
  active: boolean;
  onNavigate?: () => void;
}) {
  // Inicia expandido quando contém a rota ativa; o usuário pode recolher.
  const [open, setOpen] = useState(active);

  // Ao navegar para uma rota deste menu, reabre (sem forçar o fecho dos outros).
  useEffect(() => {
    if (active) setOpen(true);
  }, [active]);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={menuHeaderClasses(active, false)}
      >
        <menu.icon className="h-4 w-4 shrink-0" />
        <span className="flex-1 truncate text-left">{menu.title}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 transition-transform duration-200 ease-in-out",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Transição suave de altura via grid-template-rows (0fr → 1fr). */}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-in-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="mt-1 space-y-1 border-l border-white/10 pl-2 ml-4">
            {menu.items && (
              <NavItemList items={menu.items} onNavigate={onNavigate} />
            )}
            {menu.subgroups?.map((sub) => (
              <div key={sub.title} className="space-y-1">
                <h4 className="px-3 pt-1 text-[0.7rem] font-medium uppercase tracking-wide text-sidebar-foreground/40">
                  {sub.title}
                </h4>
                <NavItemList items={sub.items} onNavigate={onNavigate} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Navegação recolhida: apenas ícones, com tooltip do título ao lado. */
function CompactNav({
  activeTitle,
}: {
  activeTitle: string | undefined;
}) {
  return (
    <nav
      className="space-y-1 p-2 text-sidebar-foreground"
      aria-label="Navegação principal"
    >
      {NAV_MENUS.map((menu) => {
        const active = menu.title === activeTitle;
        const classes = cn(
          "flex items-center justify-center rounded-lg p-2 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          active
            ? "bg-blue-800 text-white"
            : "text-white/80 hover:bg-blue-800/40 hover:text-white"
        );
        const isLeaf = !menu.items && !menu.subgroups;

        return (
          <SimpleTooltip key={menu.title} content={menu.title} side="right">
            {isLeaf ? (
              <NavLink to={menu.to!} end={menu.end} className={classes}>
                <menu.icon className="h-5 w-5 shrink-0" />
              </NavLink>
            ) : (
              <div className={classes} aria-label={menu.title}>
                <menu.icon className="h-5 w-5 shrink-0" />
              </div>
            )}
          </SimpleTooltip>
        );
      })}
    </nav>
  );
}

/**
 * Conteúdo da navegação lateral (reutilizado no drawer mobile). Em `compact`
 * mostra só os ícones (estado recolhido da sidebar desktop).
 */
export function SidebarNav({
  onNavigate,
  compact = false,
}: {
  onNavigate?: () => void;
  compact?: boolean;
}) {
  const { pathname } = useLocation();
  const activeTitle = useMemo(
    () => findActiveMenuTitle(pathname),
    [pathname]
  );

  if (compact) return <CompactNav activeTitle={activeTitle} />;

  return (
    <nav
      className="space-y-1 p-3 text-sidebar-foreground"
      aria-label="Navegação principal"
    >
      {NAV_MENUS.map((menu) => {
        const active = menu.title === activeTitle;
        const isLeaf = !menu.items && !menu.subgroups;

        if (isLeaf) {
          return (
            <NavLink
              key={menu.title}
              to={menu.to!}
              end={menu.end}
              onClick={onNavigate}
              className={({ isActive }) => menuHeaderClasses(isActive, true)}
            >
              <menu.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate text-left">{menu.title}</span>
            </NavLink>
          );
        }

        return (
          <CollapsibleMenu
            key={menu.title}
            menu={menu}
            active={active}
            onNavigate={onNavigate}
          />
        );
      })}
    </nav>
  );
}

/** Sidebar fixa em desktop, recolhível (só ícones) com expansão ao passar o mouse. */
export function Sidebar() {
  const sidebar = useSidebar();
  const collapsed = sidebar?.collapsed ?? false;
  const [hovered, setHovered] = useState(false);

  // Recolhida por preferência, mas o hover expande temporariamente.
  const expanded = !collapsed || hovered;

  return (
    <aside
      className={cn(
        "relative hidden shrink-0 transition-[width] duration-200 ease-in-out lg:block",
        collapsed ? "w-16" : "w-80"
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={cn(
          "fixed bottom-0 left-0 top-14 z-30 flex flex-col border-r border-sidebar-border bg-blue-950 transition-[width] duration-200 ease-in-out dark:bg-slate-900",
          expanded ? "w-80" : "w-16",
          collapsed && hovered && "shadow-2xl shadow-black/40"
        )}
      >
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <SidebarNav compact={!expanded} />
        </div>

        <div className="shrink-0 border-t border-white/10 p-2">
          <button
            type="button"
            onClick={() => {
              // Reseta o hover para o recolher refletir na hora (sem esperar o
              // ponteiro sair do painel).
              setHovered(false);
              sidebar?.toggleCollapsed();
            }}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            aria-pressed={!collapsed}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-blue-800/40 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              !expanded && "justify-center"
            )}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-5 w-5 shrink-0" />
            ) : (
              <PanelLeftClose className="h-5 w-5 shrink-0" />
            )}
            {expanded && (
              <span className="flex-1 truncate text-left">
                {collapsed ? "Expandir menu" : "Recolher menu"}
              </span>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
