/**
 * Utilidades de exportação da página atual de uma tabela: CSV, Excel (.xls) e
 * impressão. Sem dependências externas:
 *  - Excel: HTML table com mime `application/vnd.ms-excel` (o Excel abre HTML).
 *  - Impressão: iframe oculto com uma tabela estilizada + window.print().
 */

export type ExportCell = string | number | null | undefined;

function cellToString(value: ExportCell): string {
  if (value == null) return "";
  return String(value);
}

function escHtml(value: ExportCell): string {
  return cellToString(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escCsv(value: ExportCell): string {
  const s = cellToString(value);
  if (/[";\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function stripExt(filename: string): string {
  return filename.replace(/\.[^.]+$/, "");
}

/** Exporta como CSV (separador `;`, com BOM para acentuação no Excel). */
export function downloadCsv(
  headers: string[],
  rows: ExportCell[][],
  filename: string
) {
  const lines = [
    headers.map(escCsv).join(";"),
    ...rows.map((r) => r.map(escCsv).join(";")),
  ];
  const blob = new Blob(["﻿" + lines.join("\r\n")], {
    type: "text/csv;charset=utf-8;",
  });
  triggerDownload(blob, ensureExt(filename, "csv"));
}

/** Exporta como planilha Excel (.xls) via tabela HTML. */
export function downloadExcel(
  headers: string[],
  rows: ExportCell[][],
  filename: string
) {
  const thead = `<tr>${headers.map((h) => `<th>${escHtml(h)}</th>`).join("")}</tr>`;
  const tbody = rows
    .map(
      (r) => `<tr>${r.map((c) => `<td>${escHtml(c)}</td>`).join("")}</tr>`
    )
    .join("");
  const html =
    `<html xmlns:o="urn:schemas-microsoft-com:office:office" ` +
    `xmlns:x="urn:schemas-microsoft-com:office:excel" ` +
    `xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head>` +
    `<body><table border="1"><thead>${thead}</thead><tbody>${tbody}</tbody></table></body></html>`;
  const blob = new Blob(["﻿" + html], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  triggerDownload(blob, `${stripExt(filename)}.xls`);
}

/** Abre a caixa de impressão com uma versão limpa da tabela. */
export function printTable(
  headers: string[],
  rows: ExportCell[][],
  title: string
) {
  const thead = `<tr>${headers.map((h) => `<th>${escHtml(h)}</th>`).join("")}</tr>`;
  const tbody = rows
    .map(
      (r) => `<tr>${r.map((c) => `<td>${escHtml(c)}</td>`).join("")}</tr>`
    )
    .join("");
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<title>${escHtml(title)}</title>
<style>
  *{box-sizing:border-box}
  body{font-family:Inter,system-ui,-apple-system,sans-serif;color:#0f172a;margin:24px}
  h1{font-size:15px;margin:0 0 16px}
  table{border-collapse:collapse;width:100%;font-size:11px}
  th,td{border:1px solid #cbd5e1;padding:5px 8px;text-align:left;vertical-align:top}
  thead th{background:#f1f5f9;font-weight:600}
  tbody tr:nth-child(even){background:#f8fafc}
  @media print{@page{margin:14mm}}
</style></head>
<body><h1>${escHtml(title)}</h1>
<table><thead>${thead}</thead><tbody>${tbody}</tbody></table></body></html>`;

  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  Object.assign(iframe.style, {
    position: "fixed",
    right: "0",
    bottom: "0",
    width: "0",
    height: "0",
    border: "0",
  });
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    return;
  }
  doc.open();
  doc.write(html);
  doc.close();

  // Espera o layout antes de imprimir; remove o iframe depois.
  window.setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    window.setTimeout(() => {
      if (iframe.parentNode) document.body.removeChild(iframe);
    }, 1000);
  }, 300);
}

function ensureExt(filename: string, ext: string): string {
  return filename.toLowerCase().endsWith(`.${ext}`)
    ? filename
    : `${stripExt(filename)}.${ext}`;
}
