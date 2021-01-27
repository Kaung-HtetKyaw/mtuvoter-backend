const AppError = require("../utils/AppError");
const { catchAsyncError } = require("../utils/error");
const Election = require("../models/Election");
const handler = require("../factory/handler");

exports.createElection = handler.createOne(Election);
exports.updateElection = handler.updateOne(Election);
exports.getElection = handler.getOne(
  Election,
  {
    path: "positions candidates",
    select: "-__v ",
  },
  true
);

// exports.checkCache = handler.checkCache((req) => {
//   return req.params.id || req.params.election;
// });

exports.getLatestElection = catchAsyncError(async (req, res, next) => {
  const election = await Election.findOne({
    endDate: {
      $lte: Date.now(),
    },
  }).populate("positions");

  res.status(200).json({
    status: "success",
    data: election,
  });
});

exports.getALlElections = handler.getAll(Election, (req) => {
  let { year } = req.query;
  if (year) {
    return {
      startDate: {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-01`),
      },
    };
  }
});
exports.deleteElection = handler.deleteOne(Election);

exports.started = catchAsyncError(async (req, res, next) => {
  // make sure election comes first
  const electionId = req.body.election || req.params.id || req.body._election;
  const election = await Election.findById(electionId).select("+startDate");
  if (Date.now() > election.startDate) {
    return next(
      new AppError(
        "You cannot perform this action because election has already started",
        400
      )
    );
  }
  next();
});
exports.notStarted = catchAsyncError(async (req, res, next) => {
  // make sure election comes first
  const electionId = req.body.election || req.params.id || req.body._election;
  const election = await Election.findById(electionId).select("+startDate");
  if (Date.now() < election.startDate) {
    return next(
      new AppError(
        "You cannot perform this action because election has not started yet",
        400
      )
    );
  }
  next();
});

exports.raced = catchAsyncError(async (req, res, next) => {
  const electionID =
    req.body.election || req.params.election || req.body._election;
  if (!electionID) {
    return next(new AppError("Invalid election", 404));
  }
  const election = await Election.findById(electionID).select("+startDate");
  if (Date.now() > election.endDate) {
    return next(
      new AppError(
        "You cannot perform this action because election has already been called raced",
        400
      )
    );
  }
  next();
});
