import { useState, useMemo } from 'react';

const PANEL_PAGE_SIZE = 10;

export function usePanelPagination<T>(items: T[], pageSize = PANEL_PAGE_SIZE) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const paged = useMemo(
    () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
    [items, safePage, pageSize]
  );

  return { page: safePage, setPage, totalPages, paged };
}
