import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  DEFAULT_PAGE_SIZE,
  readIntParam,
  readParam,
  patchSearchParams,
} from "@/lib/url";

interface Options {
  defaultOrdering?: string;
  defaultPageSize?: number;
}

/**
 * Liga o estado de uma listagem (page, page_size, ordering, search e filtros
 * arbitrários) à querystring — fonte única de verdade, compartilhável.
 */
export function useListUrlState(opts: Options = {}) {
  const { defaultOrdering, defaultPageSize = DEFAULT_PAGE_SIZE } = opts;
  const [searchParams, setSearchParams] = useSearchParams();

  const page = readIntParam(searchParams, "page", 1);
  const pageSize = readIntParam(searchParams, "page_size", defaultPageSize);
  const ordering = readParam(searchParams, "ordering") ?? defaultOrdering;
  const search = readParam(searchParams, "search") ?? "";

  const patch = useCallback(
    (
      values: Record<string, string | number | undefined | null>,
      opts?: { resetPage?: boolean }
    ) => {
      setSearchParams(
        (prev) => {
          const next = patchSearchParams(prev, values);
          if (opts?.resetPage) next.delete("page");
          return next;
        },
        { replace: false }
      );
    },
    [setSearchParams]
  );

  const setPage = useCallback(
    (p: number) => patch({ page: p <= 1 ? undefined : p }),
    [patch]
  );

  const setPageSize = useCallback(
    (size: number) =>
      patch(
        { page_size: size === DEFAULT_PAGE_SIZE ? undefined : size },
        { resetPage: true }
      ),
    [patch]
  );

  const setOrdering = useCallback(
    (value: string | undefined) =>
      patch(
        { ordering: value === defaultOrdering ? undefined : value },
        { resetPage: true }
      ),
    [patch, defaultOrdering]
  );

  const setSearch = useCallback(
    (value: string) => patch({ search: value || undefined }, { resetPage: true }),
    [patch]
  );

  return {
    searchParams,
    page,
    pageSize,
    ordering,
    search,
    setPage,
    setPageSize,
    setOrdering,
    setSearch,
    /** Patch genérico (filtros), reiniciando a paginação. */
    setFilters: (values: Record<string, string | undefined | null>) =>
      patch(values, { resetPage: true }),
  };
}
