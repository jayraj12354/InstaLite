import { Router } from "express";
import { guard } from "../middleware/auth.js";
import { AppError } from "../utils/errors.js";

export function buildInteractionRouter(db) {
  const rtr = Router();

  rtr.post("/:postId/like", guard, async (req, res, next) => {
    try {
      const pid = parseInt(req.params.postId);

      const targetPost = await db.post.findUnique({ where: { id: pid } });
      if (!targetPost) throw AppError.missing("Post not found");

      await db.like.create({
        data: { userId: req.currentUser.id, postId: pid },
      });

      res.status(201).json({ ok: true, message: "Post liked" });
    } catch (err) {
      if (err.code === "P2002") {
        return next(AppError.duplicate("Already liked this post"));
      }
      next(err);
    }
  });

  rtr.delete("/:postId/like", guard, async (req, res, next) => {
    try {
      const pid = parseInt(req.params.postId);

      await db.like.deleteMany({
        where: { userId: req.currentUser.id, postId: pid },
      });

      res.json({ ok: true, message: "Like removed" });
    } catch (err) {
      next(err);
    }
  });

  rtr.post("/:postId/comments", guard, async (req, res, next) => {
    try {
      const pid = parseInt(req.params.postId);
      const { body } = req.body;

      if (!body || !body.trim()) {
        throw AppError.badReq("Comment body is required");
      }

      const targetPost = await db.post.findUnique({ where: { id: pid } });
      if (!targetPost) throw AppError.missing("Post not found");

      const newComment = await db.comment.create({
        data: { body, userId: req.currentUser.id, postId: pid },
        include: { user: { select: { id: true, username: true, avatarUrl: true } } },
      });

      res.status(201).json({ ok: true, data: newComment });
    } catch (err) {
      next(err);
    }
  });

  rtr.delete("/:postId/comments/:commentId", guard, async (req, res, next) => {
    try {
      const cid = parseInt(req.params.commentId);

      const existing = await db.comment.findUnique({ where: { id: cid } });
      if (!existing) throw AppError.missing("Comment not found");
      if (existing.userId !== req.currentUser.id) throw AppError.denied("Not your comment");

      await db.comment.delete({ where: { id: cid } });

      res.json({ ok: true, message: "Comment deleted" });
    } catch (err) {
      next(err);
    }
  });

  return rtr;
}
