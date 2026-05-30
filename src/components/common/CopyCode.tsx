import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toaster";

interface CopyCodeProps {
  value: string;
  className?: string;
  /** Não interromper a navegação da linha clicável ao copiar. */
  stopPropagation?: boolean;
}

/** Código monoespaçado com botão de copiar (clipboard + toast). */
export function CopyCode({
  value,
  className,
  stopPropagation = true,
}: CopyCodeProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy(e: React.MouseEvent) {
    if (stopPropagation) e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Código copiado", { description: value });
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Não foi possível copiar.");
    }
  }

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <code className="font-mono text-[0.8125rem] tabular-nums">{value}</code>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={`Copiar código ${value}`}
        className="rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring group-hover:opacity-100"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-success" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
    </span>
  );
}
