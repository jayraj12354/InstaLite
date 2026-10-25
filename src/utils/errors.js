export class AppError extends Error {
  constructor(code, msg) {
    super(msg);
    this.statusCode = code;
    this.name = "AppError";
  }

  static badReq(msg = "Bad request") {
    return new AppError(400, msg);
  }

  static noAuth(msg = "Unauthorized") {
    return new AppError(401, msg);
  }

  static denied(msg = "Forbidden") {
    return new AppError(403, msg);
  }

  static missing(msg = "Not found") {
    return new AppError(404, msg);
  }

  static duplicate(msg = "Conflict") {
    return new AppError(409, msg);
  }
}
