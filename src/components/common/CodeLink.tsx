import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

/** Código monoespaçado que linka para o detalhe de um dicionário. */
export function CodeLink({
  to,
  code,
  className,
}: {
  to: string;
  code: string;
  className?: string;
}) {
  return (
    <Link
      to={to}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "rounded font-mono text-[0.8125rem] tabular-nums text-primary hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        className
      )}
    >
      {code}
    </Link>
  );
}
