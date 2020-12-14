const AppError = require("../utils/AppError");
const { catchAsyncError } = require("../utils/error");
const Ballot = require("../models/Ballot");

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

// get user's vote status on a candidate for a position in a election
exports.getVoteStatus = catchAsyncError(async (req, res, next) => {
  const {
    election: _election,
    position: _post,
    candidate: _candidate,
  } = req.body;

  const voted = await Ballot.exists({
    _election,
    _post,
    _candidate,
  });
  const statusCode = voted ? 400 : 200;
  res.status(statusCode).json({
    status: "success",
    data: voted,
  });
});
