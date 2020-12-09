const mongoose = require("mongoose");
const AppError = require("../utils/AppError");
const { catchAsyncError } = require("../utils/error");
const Candidate = require("../models/Candidate");
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

exports.getCandidatesByElection = handler.getAll(Candidate, (req) => {
  return { _election: mongoose.Types.ObjectId(req.params.election) };
});
