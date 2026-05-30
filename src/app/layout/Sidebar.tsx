import { NavLink } from "react-router-dom";
import { Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_SECTIONS, PRIMARY_NAV } from "./navigation";

function itemClasses(isActive: boolean) {
  return cn(
    "flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
    isActive
      ? "bg-blue-800 font-medium text-white py-2"
      : "text-sidebar-foreground hover:bg-sky-600 hover:text-sidebar-accent-foreground transition-all duration-200 ease-in-out"
  );
}

/** Conteúdo da navegação lateral (reutilizado no drawer mobile). */
export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav
      className="space-y-4 p-3 text-sidebar-foreground"
      aria-label="Navegação principal"
    >
      <NavLink
        to="/"
        end
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            "flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            isActive
              ? "bg-blue-800 font-medium text-white"
              : "text-white/80 hover:bg-blue-800/40 hover:text-sidebar-accent-foreground"
          )
        }
      >
        <Home className="h-4 w-4 shrink-0" />
        Página inicial
      </NavLink>

      <NavLink
        to={PRIMARY_NAV.to}
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            isActive
              ? "bg-blue-800 font-medium text-white"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:bg-blue-800/40"
          )
        }
      >
        <PRIMARY_NAV.icon className="h-4 w-4" />
        {PRIMARY_NAV.label}
      </NavLink>

      {NAV_SECTIONS.map((section) => (
        <div key={section.title} className="space-y-1">
          <h3 className="px-3 text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/50">
            {section.title}
          </h3>
          <ul>
            {section.items.map((item) => (
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
        </div>
      ))}
    </nav>
  );
}

/** Sidebar fixa em desktop. */
export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-blue-950 dark:bg-slate-900 lg:block">
      <div className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto">
        <SidebarNav />
      </div>
    </aside>
  );
}
