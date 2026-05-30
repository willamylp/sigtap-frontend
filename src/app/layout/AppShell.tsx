import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Skeleton } from "@/components/ui/skeleton";

function RouteFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-10 w-full max-w-md" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}

export function AppShell() {
  return (
    <div className="min-h-screen bg-canvas">
      <Header />
      <div className="flex min-h-[calc(100vh-3.5rem)]">
        <Sidebar />
        <main className="min-w-0 flex-1 bg-slate-100 dark:bg-slate-800 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-none">
            <Suspense fallback={<RouteFallback />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
