import { Router } from "express";
import { encryptPass, matchPass, createToken } from "../utils/auth.js";
import { AppError } from "../utils/errors.js";

export function buildAuthRouter(db) {
  const rtr = Router();

  rtr.post("/register", async (req, res, next) => {
    try {
      const { username, email, password, fullname, bio } = req.body;

      if (!username || !email || !password || !fullname) {
        throw AppError.badReq("username, email, password, and fullname are required");
      }

      const found = await db.user.findFirst({
        where: { OR: [{ username }, { email }] },
      });

      if (found) {
        throw AppError.duplicate("Username or email already taken");
      }

      const encrypted = await encryptPass(password);

      const newUser = await db.user.create({
        data: { username, email, passHash: encrypted, fullname, bio },
        select: { id: true, username: true, email: true, fullname: true, bio: true, createdAt: true },
      });

      const tok = createToken({ id: newUser.id, username: newUser.username });

      res.status(201).json({ ok: true, data: { user: newUser, token: tok } });
    } catch (err) {
      next(err);
    }
  });

  rtr.post("/login", async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw AppError.badReq("email and password are required");
      }

      const account = await db.user.findUnique({ where: { email } });

      if (!account) {
        throw AppError.noAuth("Invalid credentials");
      }

      const isMatch = await matchPass(password, account.passHash);
      if (!isMatch) {
        throw AppError.noAuth("Invalid credentials");
      }

      const tok = createToken({ id: account.id, username: account.username });

      res.json({
        ok: true,
        data: {
          user: { id: account.id, username: account.username, email: account.email, fullname: account.fullname },
          token: tok,
        },
      });
    } catch (err) {
      next(err);
    }
  });

  return rtr;
}
