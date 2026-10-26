import { AppError } from "../utils/errors.js";

export function checkBody(requiredFields) {
  return (req, res, next) => {
    const absent = requiredFields.filter((f) => {
      const val = req.body[f];
      return val === undefined || val === null || val === "";
    });

    if (absent.length > 0) {
      return next(
        AppError.badReq(`Missing required fields: ${absent.join(", ")}`)
      );
    }

    next();
  };
}

export function checkParams(paramNames) {
  return (req, res, next) => {
    for (const p of paramNames) {
      const val = parseInt(req.params[p]);
      if (isNaN(val) || val <= 0) {
        return next(
          AppError.badReq(`Invalid parameter: ${p} must be a positive integer`)
        );
      }
    }
    next();
  };
}
