import { Badge } from "@/components/ui/badge";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { resolveLabel, type LabelDef } from "@/lib/labels";

interface TpBadgeProps {
  code: string | boolean | null | undefined;
  map: Record<string, LabelDef>;
  /** Texto exibido quando não há código. Por padrão, nada é renderizado. */
  fallback?: React.ReactNode;
}

/**
 * Renderiza um código TP_* como badge colorida com rótulo legível (Anexo C).
 * Códigos não mapeados aparecem crus com tooltip "a confirmar".
 */
export function TpBadge({ code, map, fallback = null }: TpBadgeProps) {
  const key = typeof code === "boolean" ? String(code) : code;
  const def = resolveLabel(map, key);
  if (!def) return <>{fallback}</>;

  const badge = (
    <Badge tone={def.tone}>
      {def.label}
      {def.unconfirmed && <span className="ml-1 opacity-60">*</span>}
    </Badge>
  );

  if (def.unconfirmed) {
    return (
      <SimpleTooltip content="Significado a confirmar com a área de negócio.">
        <span className="cursor-help">{badge}</span>
      </SimpleTooltip>
    );
  }
  return badge;
}
