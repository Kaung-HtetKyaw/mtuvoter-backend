const mongoose = require("mongoose");
const AppError = require("../utils/AppError");
const { catchAsyncError } = require("../utils/error");
const Candidate = require("../models/Candidate");
const Ballot = require("../models/Ballot");
const handler = require("../factory/handler");

exports.createCandidate = catchAsyncError(async (req, res, next) => {
  const candidate = await Candidate.create({
    ...req.body,
    _election: req.params.election,
    _post: req.params.position,
  });
  res.status(201).json({
    status: "success",
    data: candidate,
  });
});

exports.updateCandidate = catchAsyncError(async (req, res, next) => {
  const { election, position, id } = req.params;
  const candidate = await Candidate.findOneAndUpdate(
    {
      _election: mongoose.Types.ObjectId(election),
      _post: mongoose.Types.ObjectId(position),
      _id: mongoose.Types.ObjectId(id),
    },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!candidate) {
    return next(new AppError("Cannot find the candidate", 404));
  }
  res.status(200).json({
    status: "success",
    data: candidate,
  });
});

exports.getCandidatesByElection = handler.getAll(Candidate, (req) => {
  return { _election: mongoose.Types.ObjectId(req.params.election) };
});
