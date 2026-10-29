//server/src/utils/pagination.js

export const DEFAULT_PAGE_SIZE = 1;
export const MAX_PAGE_SIZE = 50;

export function normalizePagination({ page, pageSize }) {
    const p = Number.parseInt(page, 10);
    const s = Number.parseInt(pageSize, 10);
    return {
        page: Number.isInteger(p) && p >= 1 ? p : 1,
        pageSize: Number.isInteger(s) && s >= 1 ? Math.min(s, MAX_PAGE_SIZE) : DEFAULT_PAGE_SIZE,
    };
}