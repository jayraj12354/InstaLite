import { AppError } from "../utils/errors.js";

export function handleErrors(err, req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      ok: false,
      error: err.message,
    });
  }

  console.error("Unhandled error:", err);
  return res.status(500).json({
    ok: false,
    error: "Internal server error",
  });
}
