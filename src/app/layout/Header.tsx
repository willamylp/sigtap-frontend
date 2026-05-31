import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/useSidebar";
import { CompetenciaSelector } from "./CompetenciaSelector";
import { ThemeToggle } from "./ThemeToggle";
import { SidebarNav } from "./Sidebar";

function HeaderSearch({ className }: { className?: string }) {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  return (
    <form
      role="search"
      className={cn("flex items-stretch", className)}
      onSubmit={(e) => {
        e.preventDefault();
        const q = value.trim();
        navigate(q ? `/procedimentos?search=${encodeURIComponent(q)}` : "/procedimentos");
      }}
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Buscar procedimentos…"
          className="rounded-r-none pl-9"
          type="search"
          aria-label="Busca global de procedimentos"
        />
      </div>
      <Button type="submit" className="-ml-px rounded-l-none border-sky-700 border-border" aria-label="Buscar">
        <Search />
        <span className="hidden md:inline">Buscar</span>
      </Button>
    </form>
  );
}

export function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const collapsed = useSidebar()?.collapsed ?? false;

  return (
    <header className="sticky top-0 z-40 dark:border-b dark:border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow">
      <div className="flex h-14 items-stretch">
        {/* Bloco da logo — mesma largura do sidebar (alinhado à coluna escura). */}
        <div
          className={cn(
            "flex items-center gap-2 px-4 transition-[width] duration-200 ease-in-out lg:shrink-0 lg:border-r lg:border-sidebar-border lg:bg-blue-950 dark:bg-slate-950",
            collapsed ? "lg:w-16 lg:justify-center lg:px-2" : "lg:w-80"
          )}
        >
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Abrir menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-72 overflow-y-auto border-sidebar-border bg-sidebar p-0 text-sidebar-foreground"
            >
              <SheetHeader className="border-b border-sidebar-border p-4">
                <SheetTitle className="text-white">SIGTAP</SheetTitle>
              </SheetHeader>
              <SidebarNav onNavigate={() => setDrawerOpen(false)} />
            </SheetContent>
          </Sheet>

          <Link
            to="/"
            className="flex items-center gap-2 rounded font-semibold tracking-tight text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring lg:text-white"
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
              S
            </span>
            <span className={cn(collapsed && "lg:hidden")}>SIGTAP</span>
          </Link>
        </div>

        {/* Zona de conteúdo do header: busca + competência + tema. */}
        <div className="flex flex-1 items-center justify-end gap-3 px-4">
          <HeaderSearch className="hidden flex-1 sm:flex sm:max-w-xl" />
          <div className="flex items-center gap-2">
            <CompetenciaSelector />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
