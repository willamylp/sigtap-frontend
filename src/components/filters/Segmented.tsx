import { cn } from "@/lib/utils";

export interface SegmentedOption {
  value: string;
  label: string;
}

/**
 * Alternador segmentado (toggle entre opções mutuamente exclusivas), no estilo
 * dos campos "Sentido"/"Visão"/"Tipo CID" dos relatórios. Stateless: o pai
 * controla `value` e recebe a mudança em `onChange`.
 */
export function Segmented({
  value,
  onChange,
  options,
  className,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SegmentedOption[];
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex w-fit rounded-md border border-border bg-background p-0.5",
        className
      )}
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            value === o.value
              ? "bg-sky-600 text-primary-foreground hover:bg-sky-700"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
