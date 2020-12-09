const AppError = require("../utils/AppError");
const { catchAsyncError } = require("../utils/error");
const User = require("../models/User");

exports.isVerified = catchAsyncError(async (req, res, next) => {
  if (!req.user.verified) {
    return next(
      new AppError(
        "Your account is not verified yet. Please Log in again to receive a verfication email",
        400
      )
    );
  }
  next();
});
