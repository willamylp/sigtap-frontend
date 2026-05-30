import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "@/hooks/useTheme";

/** Toaster global (sonner) sincronizado com o tema. */
export function Toaster() {
  const { theme } = useTheme();
  return (
    <SonnerToaster
      theme={theme}
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "group rounded-md border border-border bg-popover text-popover-foreground shadow-md",
          description: "text-muted-foreground",
        },
      }}
    />
  );
}

export { toast } from "sonner";
