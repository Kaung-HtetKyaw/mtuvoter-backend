const mongoose = require("mongoose");
const { catchAsyncError } = require("../utils/utils");
const {
  getCookieFromRequest,
  verifyJwtToken,
  getAuthTokenFromHeaderOrCookie,
} = require("../utils/token");
const { promisify } = require("util");
const Election = require("../models/Election");
const AppError = require("../utils/AppError");
const Ballot = require("../models/Ballot");
const Token = require("../models/Token");

exports.raced = catchAsyncError(async (req, res, next) => {
  if (!req.body.election) {
    return next(new AppError("Invalid election", 404));
  }
  const election = await Election.findById(req.body.election).select(
    "+startDate"
  );
  if (Date.now() > election.endDate) {
    return next(
      new AppError(
        "You cannot perform this action because election has been called raced",
        400
      )
    );
  }
  next();
});

exports.checkVoteToken = catchAsyncError(async (req, res, next) => {
  const votingToken = getCookieFromRequest(req, "_v_t");
  if (!votingToken) {
    return next(
      new AppError(
        "Your token might have been expired. Please log in again to vote."
      )
    );
  }
  const decodedToken = await verifyJwtToken(votingToken);
  req.voting_token_id = decodedToken.id;
  next();
});

exports.hasVoted = catchAsyncError(async (req, res, next) => {
  const { election: _election, position: _post } = req.body;
  const hasAlreadyVoted = await Ballot.exists({
    _v_t: req.voting_token_id,
    _election,
    _post,
  });
  if (hasAlreadyVoted) {
    return next(new AppError("You have already voted for this position", 400));
  }
  next();
});

exports.vote = catchAsyncError(async (req, res, next) => {
  const {
    election: _election,
    position: _post,
    candidate: _candidate,
    student_type,
  } = req.body;
  const ballot = await Ballot.create({
    _v_t: req.voting_token_id,
    _election,
    _post,
    _candidate,
    student_type,
  });

  res.status(200).json({
    status: "success",
    data: ballot,
  });
});
