import { ArrowRight } from "lucide-react";
import { useDictionaryDetail } from "@/api/queries";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CopyCode } from "@/components/common/CopyCode";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/common/states";
import { DictionaryFields, getDictionaryName } from "./DictionaryFields";
import type { DictionaryConfig } from "./registry";

type Row = Record<string, unknown>;

/**
 * Detalhe de um registro de dicionário aberto em Dialog (sem trocar de página).
 * Usado pelas listagens — o detalhe de Procedimento permanece em página própria.
 */
export function DictionaryDetailDialog({
  config,
  co,
  open,
  onOpenChange,
  onVerProcedimentos,
}: {
  config: DictionaryConfig;
  co: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Quando definido e o recurso tem reversa, exibe o botão "Ver procedimentos". */
  onVerProcedimentos?: (co: string, name?: string) => void;
}) {
  const query = useDictionaryDetail<Row>(
    config.key,
    config.basePath,
    co ?? undefined,
    config.versioned
  );

  const data = query.data;
  const nome = getDictionaryName(config, data);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{config.labelSingular}</DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {co && <CopyCode value={co} className="text-foreground" />}
            {nome && <span className="text-foreground">{nome}</span>}
          </DialogDescription>
        </DialogHeader>

        {query.isError ? (
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        ) : query.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            <DictionaryFields config={config} data={data} />
            {config.reverse && co && onVerProcedimentos && (
              <div className="flex justify-end">
                <Button onClick={() => onVerProcedimentos(co, nome)}>
                  Ver procedimentos
                  <ArrowRight />
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
