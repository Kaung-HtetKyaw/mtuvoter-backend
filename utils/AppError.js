module.exports = class extends Error {
  constructor(message, statusCode) {
    super(message);
    this.isOperational = true;
    this.statusCode = statusCode;
    this.status = String(statusCode).startsWith("4") ? "fail" : "error";
    Error.captureStackTrace(this, this.constructor); // show the stack trace, but dont want to pollute with error creation
  }
};