import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReversaKind } from "@/api/queries";
import { getDictionary } from "@/features/dicionarios/registry";
import { DictionaryDetailDialog } from "@/features/dicionarios/DictionaryDetailDialog";
import { ReversaDialog } from "@/features/reversas/ReversaDialog";

interface RecordDialogContextValue {
  /** Abre o detalhe de um registro de dicionário em Dialog. */
  openRecord: (resourceKey: string, co: string) => void;
}

const RecordDialogContext = createContext<RecordDialogContextValue | null>(null);

export function useRecordDialog() {
  const ctx = useContext(RecordDialogContext);
  if (!ctx) {
    throw new Error(
      "useRecordDialog deve ser usado dentro de RecordDialogProvider"
    );
  }
  return ctx;
}

interface DetailTarget {
  resourceKey: string;
  co: string;
}
interface ReversaTarget {
  kind: ReversaKind;
  co: string;
  name?: string;
}

/**
 * Disponibiliza `openRecord(resource, co)` para abrir o detalhe de qualquer
 * registro de dicionário em Dialog (e, encadeado, a reversa de procedimentos),
 * sem trocar de página. Usado, p.ex., nas abas de relação do procedimento.
 */
export function RecordDialogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [detail, setDetail] = useState<DetailTarget | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [reversa, setReversa] = useState<ReversaTarget | null>(null);
  const [reversaOpen, setReversaOpen] = useState(false);

  const openRecord = useCallback((resourceKey: string, co: string) => {
    const config = getDictionary(resourceKey);
    if (!config?.keyField) return; // compostos não têm detalhe navegável
    setDetail({ resourceKey, co });
    setDetailOpen(true);
  }, []);

  const value = useMemo(() => ({ openRecord }), [openRecord]);

  // `detail` é mantido após fechar (config estável) para preservar a animação.
  const detailConfig = detail ? getDictionary(detail.resourceKey) : undefined;

  return (
    <RecordDialogContext.Provider value={value}>
      {children}

      {detail && detailConfig && (
        <DictionaryDetailDialog
          config={detailConfig}
          co={detail.co}
          open={detailOpen}
          onOpenChange={setDetailOpen}
          onVerProcedimentos={
            detailConfig.reverse
              ? (co, name) => {
                  setDetailOpen(false);
                  setReversa({ kind: detailConfig.reverse!, co, name });
                  setReversaOpen(true);
                }
              : undefined
          }
        />
      )}

      {reversa && (
        <ReversaDialog
          kind={reversa.kind}
          co={reversa.co}
          entityName={reversa.name}
          open={reversaOpen}
          onOpenChange={setReversaOpen}
        />
      )}
    </RecordDialogContext.Provider>
  );
}
