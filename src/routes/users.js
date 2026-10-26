import { Router } from "express";
import { guard } from "../middleware/auth.js";
import { AppError } from "../utils/errors.js";

export function buildUserRouter(db) {
  const rtr = Router();

  rtr.get("/:id", async (req, res, next) => {
    try {
      const uid = parseInt(req.params.id);
      const profile = await db.user.findUnique({
        where: { id: uid },
        select: {
          id: true,
          username: true,
          fullname: true,
          bio: true,
          avatarUrl: true,
          createdAt: true,
          _count: { select: { posts: true, followers: true, following: true } },
        },
      });

      if (!profile) throw AppError.missing("User not found");

      res.json({ ok: true, data: profile });
    } catch (err) {
      next(err);
    }
  });

  rtr.put("/me", guard, async (req, res, next) => {
    try {
      const { fullname, bio, avatarUrl } = req.body;

      const updatedProfile = await db.user.update({
        where: { id: req.currentUser.id },
        data: { fullname, bio, avatarUrl },
        select: { id: true, username: true, email: true, fullname: true, bio: true, avatarUrl: true },
      });

      res.json({ ok: true, data: updatedProfile });
    } catch (err) {
      next(err);
    }
  });

  rtr.post("/:id/follow", guard, async (req, res, next) => {
    try {
      const targetId = parseInt(req.params.id);

      if (targetId === req.currentUser.id) {
        throw AppError.badReq("You cannot follow yourself");
      }

      const targetUser = await db.user.findUnique({ where: { id: targetId } });
      if (!targetUser) throw AppError.missing("User not found");

      await db.follow.create({
        data: { followerId: req.currentUser.id, followingId: targetId },
      });

      res.status(201).json({ ok: true, message: "Followed successfully" });
    } catch (err) {
      if (err.code === "P2002") {
        return next(AppError.duplicate("Already following this user"));
      }
      next(err);
    }
  });

  rtr.delete("/:id/follow", guard, async (req, res, next) => {
    try {
      const targetId = parseInt(req.params.id);

      await db.follow.deleteMany({
        where: { followerId: req.currentUser.id, followingId: targetId },
      });

      res.json({ ok: true, message: "Unfollowed successfully" });
    } catch (err) {
      next(err);
    }
  });

  return rtr;
}
