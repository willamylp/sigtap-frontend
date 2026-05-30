/**
 * Cliente HTTP fino para a API SIGTAP (pública, somente-leitura).
 *
 * Ponto único de injeção de headers — hoje só `Accept`. Caso a API volte a
 * exigir login (PRD §13), basta adicionar `Authorization` e tratamento de 401
 * aqui, sem tocar no resto do app.
 */

const BASE = (import.meta.env.VITE_API_BASE_URL ?? "/api/v1/sigtap").replace(
  /\/$/,
  ""
);

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: string,
    message?: string
  ) {
    super(message ?? `Erro ${status}`);
    this.name = "ApiError";
  }

  /** 404 — recurso inexistente na competência. */
  get isNotFound() {
    return this.status === 404;
  }

  /** 5xx ou falha de rede (status 0). */
  get isServerOrNetwork() {
    return this.status === 0 || this.status >= 500;
  }
}

export type QueryParams = Record<
  string,
  string | number | boolean | null | undefined
>;

/** Monta a query string descartando valores vazios/nulos. */
export function buildQueryString(params?: QueryParams): string {
  if (!params) return "";
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === "" || value == null) continue;
    sp.append(key, String(value));
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

export async function apiGet<T>(
  path: string,
  params?: QueryParams,
  signal?: AbortSignal
): Promise<T> {
  const url = `${BASE}${path}${buildQueryString(params)}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    // Falha de rede / CORS — status 0.
    throw new ApiError(0, String(err), "Falha de conexão com a API.");
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ApiError(res.status, body);
  }

  // Alguns endpoints podem (teoricamente) responder 204 — defensivo.
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export { BASE as API_BASE_URL };
