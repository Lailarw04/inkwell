//server/src/utils/__tests__/pagination.test.js

import { normalizePagination, MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from "../pagination.js";

test("keeps an oversized pageSize to the maximum", () => {
    expect(normalizePagination({ page: "1", pageSize: "100000" }).pageSize).toBe(MAX_PAGE_SIZE);
});

test("keeps a reasonable pageSize unchanged", () => {
    expect(normalizePagination({ page: "1", pageSize: "20" }).pageSize).toBe(20);
});

test("falls back to defaults for invalid values", () => {
    expect(normalizePagination({ page: "0", pageSize: "-5" })).toEqual({ page: 1, pageSize: DEFAULT_PAGE_SIZE });
    expect(normalizePagination({ page: "abc", pageSize: "xyz" })).toEqual({ page: 1, pageSize: DEFAULT_PAGE_SIZE });
    expect(normalizePagination({})).toEqual({ page: 1, pageSize: DEFAULT_PAGE_SIZE });
});