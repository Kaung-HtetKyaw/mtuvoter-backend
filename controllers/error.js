const AppError = require("../utils/AppError");

module.exports = (error, req, res, next) => {
  console.log(error);
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";
  if (process.env.NODE_ENV == "development") {
    sendErrorDev(error, req, res);
  } else if (process.env.NODE_ENV == "production") {
    let normalizedError = { ...error, message: error.message };
    if (error.name == "CastError") {
      normalizedError = handleCastErrorDB(error);
    }
    if (error.code == 11000) {
      normalizedError = handleDuplicationErrorDB(error);
    }
    if (error.name == "ValidationError") {
      normalizedError = handleValidationErrorDB(error);
    }
    if (error.name == "JsonWebTokenError") {
      normalizedError = handleJWTError();
    }
    if (error.name == "TokenExpiredError") {
      normalizedError = handleJWTExpiredError();
    }
    sendErrorProd(normalizedError, req, res);
  }
};

function sendErrorDev(error, req, res) {
  // error from api
  if (req.originalUrl.startsWith("/api")) {
    console.log("prod api", error);
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      error: error,
      stack: error.stack,
    });
  }
  // error from rendered website
  return res.status(error.statusCode).render("error", {
    status: error.status,
    title: "Something went wrong",
    message: error.message,
  });
}
function sendErrorProd(error, req, res) {
  if (req.originalUrl.startsWith("/api")) {
    // catch the operational errors
    if (error.isOperational) {
      return res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
      });
    }
    // catch Programming,unexpected errors
    console.error("Error ❎", error);
    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
  // catch the operational errors
  if (error.isOperational) {
    return res.status(error.statusCode).render("error", {
      title: "Something went wrong",
      message: error.message,
    });
  }
  // catch Programming,unexpected errors
  console.error("Error ❎", error);
  return res.status(error.statusCode).render("error", {
    title: "Something went wrong",
    message: "Please try again",
  });
}

function handleCastErrorDB(error) {
  const message = `Invalid ${error.path}: ${error.value}`;
  return new AppError(message, 400);
}

function handleDuplicationErrorDB(error) {
  console.log(error);
  const keys = Object.keys(error.keyValue);
  const values = Object.values(error.keyValue);
  const errors = keys.map((key, i) => `${key}:${values[i]}`).join(", ");
  const message = `${errors} is already in use.`;
  if (error.message.includes("Natours.reviews")) {
    return new AppError("You can only write one review for a tour", 400);
  }
  return new AppError(message, 400);
}

function handleValidationErrorDB(error) {
  const errors = Object.values(error.errors)
    .map((el) => el.message)
    .join(". ");
  const message = `Invalid input data. ${errors}`;
  return new AppError(message, 400);
}

function handleJWTError() {
  return new AppError("Invalid token.Please log in again", 401);
}

function handleJWTExpiredError() {
  return new AppError("Token expired. Please log in again", 401);
}
