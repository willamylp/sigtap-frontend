import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

/** Bloco de seção com título opcional. */
export function Section({
  title,
  description,
  actions,
  children,
  className,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-3", className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between gap-2">
          <div>
            {title && (
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

/** Lista de pares chave/valor (definition list responsiva). */
export function KeyValue({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("p-0", className)}>
      <dl className="divide-y divide-border">{children}</dl>
    </Card>
  );
}

export function KeyValueItem({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-1 px-4 py-2 sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground sm:col-span-2">
        {children ?? "—"}
      </dd>
    </div>
  );
}
