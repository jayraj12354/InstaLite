import { Router } from "express";
import { guard } from "../middleware/auth.js";
import { AppError } from "../utils/errors.js";

export function buildPostRouter(db) {
  const rtr = Router();

  rtr.post("/", guard, async (req, res, next) => {
    try {
      const { caption, mediaUrl } = req.body;

      if (!mediaUrl) {
        throw AppError.badReq("mediaUrl is required");
      }

      const newPost = await db.post.create({
        data: { caption, mediaUrl, authorId: req.currentUser.id },
        include: {
          author: { select: { id: true, username: true, avatarUrl: true } },
          _count: { select: { likes: true, comments: true } },
        },
      });

      res.status(201).json({ ok: true, data: newPost });
    } catch (err) {
      next(err);
    }
  });

  rtr.get("/:id", async (req, res, next) => {
    try {
      const pid = parseInt(req.params.id);

      const postData = await db.post.findUnique({
        where: { id: pid },
        include: {
          author: { select: { id: true, username: true, avatarUrl: true } },
          comments: {
            include: { user: { select: { id: true, username: true, avatarUrl: true } } },
            orderBy: { createdAt: "desc" },
            take: 20,
          },
          _count: { select: { likes: true, comments: true } },
        },
      });

      if (!postData) throw AppError.missing("Post not found");

      res.json({ ok: true, data: postData });
    } catch (err) {
      next(err);
    }
  });

  rtr.delete("/:id", guard, async (req, res, next) => {
    try {
      const pid = parseInt(req.params.id);

      const existing = await db.post.findUnique({ where: { id: pid } });
      if (!existing) throw AppError.missing("Post not found");
      if (existing.authorId !== req.currentUser.id) throw AppError.denied("Not your post");

      await db.post.delete({ where: { id: pid } });

      res.json({ ok: true, message: "Post deleted" });
    } catch (err) {
      next(err);
    }
  });

  rtr.get("/", guard, async (req, res, next) => {
    try {
      const pg = parseInt(req.query.page) || 1;
      const lim = parseInt(req.query.limit) || 20;
      const offset = (pg - 1) * lim;

      const connections = await db.follow.findMany({
        where: { followerId: req.currentUser.id },
        select: { followingId: true },
      });

      const feedUserIds = connections.map((c) => c.followingId);
      feedUserIds.push(req.currentUser.id);

      const feedPosts = await db.post.findMany({
        where: { authorId: { in: feedUserIds } },
        include: {
          author: { select: { id: true, username: true, avatarUrl: true } },
          _count: { select: { likes: true, comments: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: lim,
      });

      res.json({ ok: true, data: feedPosts, page: pg, limit: lim });
    } catch (err) {
      next(err);
    }
  });

  return rtr;
}
