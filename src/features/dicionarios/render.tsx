import { CopyCode } from "@/components/common/CopyCode";
import { TpBadge } from "@/components/common/TpBadge";
import { TP_AGRAVO, TP_PROCEDIMENTO_SIA_SIH, TP_SEXO } from "@/lib/labels";
import type { DicCellKind } from "./registry";

/** Renderiza o valor de um campo de dicionário conforme seu "kind". */
export function renderDicValue(
  kind: DicCellKind | undefined,
  value: unknown
): React.ReactNode {
  if (value == null || value === "") {
    return <span className="text-muted-foreground">—</span>;
  }
  const str = String(value);

  switch (kind) {
    case "code":
      return <CopyCode value={str} />;
    case "tpSexo":
      return <TpBadge code={str} map={TP_SEXO} />;
    case "tpSiaSih":
      return <TpBadge code={str} map={TP_PROCEDIMENTO_SIA_SIH} />;
    case "tpAgravo":
      return <TpBadge code={str} map={TP_AGRAVO} />;
    case "long":
      return <span className="whitespace-pre-line text-foreground">{str}</span>;
    case "text":
    default:
      return <span>{str}</span>;
  }
}
