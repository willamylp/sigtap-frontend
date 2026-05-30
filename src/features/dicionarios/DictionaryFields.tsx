import { useMemo } from "react";
import { KeyValue, KeyValueItem } from "@/components/common/KeyValue";
import { renderDicValue } from "./render";
import type { DicDetailField, DictionaryConfig } from "./registry";

type Row = Record<string, unknown>;

/** Campos exibidos no detalhe (config.detailFields ou derivados das colunas). */
export function getDictionaryFields(config: DictionaryConfig): DicDetailField[] {
  if (config.detailFields) return config.detailFields;
  return config.columns.map((c) => ({
    label: c.header,
    field: c.field,
    kind: c.kind,
  }));
}

/** Nome legível do registro (primeira coluna não-código). */
export function getDictionaryName(
  config: DictionaryConfig,
  data: Row | undefined
): string | undefined {
  const nameField = config.columns.find((c) => c.kind !== "code")?.field;
  return nameField ? (data?.[nameField] as string | undefined) : undefined;
}

/** Lista chave/valor dos campos do registro — compartilhada entre página e dialog. */
export function DictionaryFields({
  config,
  data,
}: {
  config: DictionaryConfig;
  data: Row | undefined;
}) {
  const fields = useMemo(() => getDictionaryFields(config), [config]);
  return (
    <KeyValue>
      {fields.map((f) => (
        <KeyValueItem key={f.field} label={f.label}>
          {renderDicValue(f.kind, data?.[f.field])}
        </KeyValueItem>
      ))}
    </KeyValue>
  );
}
