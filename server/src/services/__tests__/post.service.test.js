// server/src/services/__tests__/post.service.test.js
import { jest } from "@jest/globals";

const mockPostRepository = { createWithTags: jest.fn() };
const mockEventBus = { emit: jest.fn() };
const mockPrisma = { post: { findMany: jest.fn() } };

jest.unstable_mockModule("../../repositories/post.repository.js", () => ({
PostRepository: mockPostRepository,
}));
jest.unstable_mockModule("../../events/event-bus.js", () => ({
    EventBus: mockEventBus,
}));
jest.unstable_mockModule("../../db/client.js", () => ({
    prisma: mockPrisma,
}));

const { PostService } = await import("../post.service.js");

test("publish() creates a PUBLISHED post and emits post.published", async () => {
    mockPostRepository.createWithTags.mockResolvedValue({ id: "p1", title: "Hello", status: "PUBLISHED" });
        const post = await PostService.publish({ authorId: "u1", title: "Hello", body: "World" });  
        expect(post.status).toBe("PUBLISHED");
        expect(mockEventBus.emit).toHaveBeenCalledWith(
            "post.published",
            expect.objectContaining({ postId: "p1" })
        );
});
test("publish() rejects an empty title", async () => {
    await expect(
        PostService.publish({ authorId: "u1", title: "", body: "World" })
        ).rejects.toThrow();
});

beforeEach(() => {
    jest.clearAllMocks();
});

test("searchPublished() searches the title for the query", async () => {
    mockPrisma.post.findMany.mockResolvedValue([
        { id: "p1", title: "Hello", status: "PUBLISHED" },
    ]);

    const result = await PostRepository.searchPublished({
        query: "Hello",
        page: 1,
        pageSize: 10,
    });

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
        { id: "p2", title: "Unrelated", body: "boundary testing" },
    ]);

    const result = await PostRepository.searchPublished({
        query: "boundary",
        page: 1,
        pageSize: 10,
    });

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

    const result = await PostRepository.searchPublished({
        query: "testing",
        page: 1,
        pageSize: 10,
    });

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

    const result = await PostRepository.searchPublished({
        query: "Match",
        page: 1,
        pageSize: 5,
    });

    expect(result.posts).toHaveLength(5);
    expect(result.hasMore).toBe(true);
    expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 6 })
    );
});