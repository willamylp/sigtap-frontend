import { cn } from "@/lib/utils";
import { useRecordDialog } from "./RecordDialogProvider";

/**
 * Código clicável que abre o detalhe de um registro de dicionário em Dialog
 * (em vez de navegar). Visualmente idêntico ao CodeLink.
 */
export function RecordLink({
  resource,
  co,
  className,
}: {
  resource: string;
  co: string;
  className?: string;
}) {
  const { openRecord } = useRecordDialog();
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        openRecord(resource, co);
      }}
      className={cn(
        "rounded font-mono text-[0.8125rem] tabular-nums text-primary hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        className
      )}
    >
      {co}
    </button>
  );
}
