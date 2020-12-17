const AppError = require("../utils/AppError");
const { catchAsyncError } = require("../utils/error");
const Election = require("../models/Election");
const handler = require("../factory/handler");

exports.createElection = handler.createOne(Election);
exports.updateElection = handler.updateOne(Election);
exports.getElection = handler.getOne(Election, {
  path: "positions candidates",
  select: "-__v ",
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

exports.hasElectionStarted = catchAsyncError(async (req, res, next) => {
  // make sure election comes first
  const electionId = req.params.election || req.params.id;
  console.log(electionId);
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
