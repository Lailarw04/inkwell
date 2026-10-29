// server/src/routes/post.routes.js
//
// Wires PostService's publish() and listPublished() to
// the API contract's POST /api/posts and GET /api/posts (Lecture 4).
// Same thin-route discipline as auth.routes.js: no business rules here.
import { Router } from "express";
import { PostService } from "../services/post.service.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { normalizePagination } from "../utils/pagination.js";

const router = Router();
router.post("/posts", requireAuth, async (req, res, next) =>
{
    try {
        // Never trust client-supplied identity fields — derive
        // authorId from the authenticated request, not the request body.
        const post = await PostService.publish({
            ...req.body,
            authorId: req.user.id, // set by requireAuth middleware from the verified JWT 
        });
    res.status(201).json(post);
    } catch (err) {
    next(err);
    }
 });

router.get("/posts", async (req, res, next) => {
    try {
        const { search } = req.query;
        const { page, pageSize} = normalizePagination(req.query);
        const result = search
            ? await PostService.search({
                query: search, page, pageSize
            })
            : await PostService.listPublished({
                page, pageSize
            });
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});

router.get("/stats", async (req, res) => {
    res.json({ totalPosts: totalPostsPublished });
});

export default router;