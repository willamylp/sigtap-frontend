import { useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { ApiError } from "@/api/client";
import { ThemeProvider } from "./providers/ThemeProvider";
import { CompetenciaProvider } from "./providers/CompetenciaProvider";
import { SidebarProvider } from "./providers/SidebarProvider";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Não refazer agressivamente; dados do SIGTAP são estáveis na competência.
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          // Não insistir em 404 (recurso inexistente na competência).
          if (error instanceof ApiError && error.isNotFound) return false;
          return failureCount < 2;
        },
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
      },
    },
  });
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  // QueryClient estável por instância de app.
  const [queryClient] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <SidebarProvider>
            <CompetenciaProvider>
              <TooltipProvider delayDuration={200}>
                {children}
                <Toaster />
              </TooltipProvider>
            </CompetenciaProvider>
          </SidebarProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
