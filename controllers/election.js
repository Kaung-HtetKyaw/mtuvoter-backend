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
exports.getALlElections = handler.getAll(Election);
exports.deleteElection = handler.deleteOne(Election);

exports.hasElectionStarted = catchAsyncError(async (req, res, next) => {
  const electionId = req.params.id || req.params.election;
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
