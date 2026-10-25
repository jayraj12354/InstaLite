import { decodeToken } from "../utils/auth.js";
import { AppError } from "../utils/errors.js";

export function guard(req, res, next) {
  const hdr = req.headers.authorization;

  if (!hdr || !hdr.startsWith("Bearer ")) {
    return next(AppError.noAuth("Missing or invalid authorization header"));
  }

  const tok = hdr.split(" ")[1];

  try {
    const payload = decodeToken(tok);
    req.currentUser = payload;
    next();
  } catch (err) {
    return next(AppError.noAuth("Invalid or expired token"));
  }
}
