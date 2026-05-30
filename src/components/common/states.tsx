import { AlertTriangle, Inbox, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/api/client";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title?: string;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

/** Estado vazio dedicado (count: 0). Não confundir com erro. */
export function EmptyState({
  title = "Nada por aqui",
  description = "Nenhum resultado encontrado para esta consulta.",
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border px-6 py-14 text-center",
        className
      )}
    >
      <div className="text-muted-foreground">
        {icon ?? <Inbox className="h-9 w-9" />}
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}

/** Estado "não encontrado" (404). */
export function NotFoundState({
  title = "Não encontrado",
  description = "O recurso não existe na competência selecionada.",
  action,
}: EmptyStateProps) {
  return (
    <EmptyState
      title={title}
      description={description}
      icon={<SearchX className="h-9 w-9" />}
      action={action}
    />
  );
}

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  className?: string;
}

/** Estado de erro de rede/5xx com botão "Tentar novamente". */
export function ErrorState({ error, onRetry, className }: ErrorStateProps) {
  // 404 não é erro de sistema — vira "não encontrado".
  if (error instanceof ApiError && error.isNotFound) {
    return <NotFoundState />;
  }

  const message =
    error instanceof ApiError
      ? error.isServerOrNetwork
        ? "Não conseguimos falar com a API. Verifique sua conexão e tente de novo."
        : `Erro ${error.status} ao consultar a API.`
      : "Ocorreu um erro inesperado.";

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-6 py-14 text-center",
        className
      )}
    >
      <AlertTriangle className="h-9 w-9 text-destructive" />
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">
          Algo deu errado
        </h3>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground">
          {message}
        </p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
