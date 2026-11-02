// server/src/repositories/__tests__/post.repository.test.js
import { jest } from "@jest/globals";

const mockPrisma = { post: { findMany: jest.fn() } };

jest.unstable_mockModule("../../db/client.js", () => ({
    prisma: mockPrisma,
}));
jest.unstable_mockModule("../../dto/user.dto.js", () => ({
    toPublicUser: (user) => user,
}));

const { PostRepository } = await import("../post.repository.js");

const author = { id: "u1", displayName: "Alice" };

beforeEach(() => {
    jest.clearAllMocks();
});

test("searchPublished() searches the title for the query", async () => {
    mockPrisma.post.findMany.mockResolvedValue([
        { id: "p1", title: "Hello", status: "PUBLISHED", author },
    ]);

    const result = await PostRepository.searchPublished({ query: "Hello", page: 1, pageSize: 10 });

    expect(result.posts).toHaveLength(1);
    expect(result.hasMore).toBe(false);
    expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
            where: expect.objectContaining({
                OR: expect.arrayContaining([
                    { title: { contains: "Hello", mode: "insensitive" } },
                ]),
            }),
        })
    );
});

test("searchPublished() searches the body for the query", async () => {
    mockPrisma.post.findMany.mockResolvedValue([
        { id: "p2", title: "Unrelated", body: "boundary testing", author },
    ]);

    const result = await PostRepository.searchPublished({ query: "boundary", page: 1, pageSize: 10 });

    expect(result.posts).toHaveLength(1);
    expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
            where: expect.objectContaining({
                OR: expect.arrayContaining([
                    { body: { contains: "boundary", mode: "insensitive" } },
                ]),
            }),
        })
    );
});

test("searchPublished() only queries PUBLISHED posts", async () => {
    mockPrisma.post.findMany.mockResolvedValue([]);

    const result = await PostRepository.searchPublished({ query: "testing", page: 1, pageSize: 10 });

    expect(result).toEqual({ posts: [], hasMore: false });
    expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
            where: expect.objectContaining({ status: "PUBLISHED" }),
        })
    );
});

test("searchPublished() returns pageSize posts and hasMore=true when pageSize + 1 rows come back", async () => {
    const rows = Array.from({ length: 6 }, (_, i) => ({ id: `p${i}` }));
    mockPrisma.post.findMany.mockResolvedValue(rows);

    const result = await PostRepository.searchPublished({ query: "Match", page: 1, pageSize: 5 });

    expect(result.posts).toHaveLength(5);
    expect(result.hasMore).toBe(true);
    expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 6 })
    );
});