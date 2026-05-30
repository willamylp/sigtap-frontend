import { formatBRL, formatIdade, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Célula monetária BRL, alinhada à direita, com numerais tabulares. */
export function MoneyCell({
  value,
  className,
}: {
  value: string | number | null | undefined;
  className?: string;
}) {
  return (
    <span className={cn("tabular-nums", className)}>{formatBRL(value)}</span>
  );
}

/** Célula de percentual (string decimal → "12,50 %"). */
export function PercentCell({
  value,
  className,
}: {
  value: string | number | null | undefined;
  className?: string;
}) {
  return (
    <span className={cn("tabular-nums", className)}>
      {formatPercent(value)}
    </span>
  );
}

/** Idade em meses → rótulo amigável. */
export function IdadeCell({
  meses,
}: {
  meses: number | null | undefined;
}) {
  return <span className="tabular-nums">{formatIdade(meses)}</span>;
}
