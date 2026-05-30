import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Texto à esquerda do título (ex.: contagem/"competência"). */
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  meta,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <div className="min-w-0 space-y-1">
        <h1 className="truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {title}
        </h1>
        {meta && (
          <p className="text-sm text-muted-foreground">{meta}</p>
        )}
        {description && (
          <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
