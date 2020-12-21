const mongoose = require("mongoose");
const AppError = require("../utils/AppError");
const { catchAsyncError } = require("../utils/error");
const Candidate = require("../models/Candidate");
const Ballot = require("../models/Ballot");
const handler = require("../factory/handler");
const Storage = require("../services/Storage/Storage");

const { v4: uuid } = require("uuid");

const storage = new Storage({ width: 500, height: 500 });
const multerUpload = storage.createMulterUpload();

exports.convertFileToBuffer = multerUpload.single("photo");

exports.uploadFile = handler.uploadFile(storage, "candidates", Candidate);

exports.createCandidate = catchAsyncError(async (req, res, next) => {
  const candidate = await Candidate.create({
    ...req.body,
    _election: req.params.election,
    _post: req.params.position,
    photo: req.file.filename,
  });
  if (!req.file) {
    return next(new AppError("Please upload candidate photo", 400));
  }
  res.status(201).json({
    status: "success",
    data: candidate,
  });
});

exports.updateCandidate = handler.updateOne(
  Candidate,
  (req) => {
    const { election, position, id } = req.params;
    return {
      _election: mongoose.Types.ObjectId(election),
      _post: mongoose.Types.ObjectId(position),
      _id: mongoose.Types.ObjectId(id),
    };
  },
  true
);

exports.getCandidate = handler.getOne(
  Candidate,
  {
    path: "_election _post",
  },
  true
);
// get candidates for a election or for a position
exports.getCandidates = handler.getAll(Candidate, (req) => {
  let filter = {};
  if (req.params.election)
    filter._election = mongoose.Types.ObjectId(req.params.election);
  if (req.params.position)
    filter._post = mongoose.Types.ObjectId(req.params.position);
  return filter;
});
exports.deleteCandidate = handler.deleteOne(Candidate);

exports.checkCacheCandidate = handler.checkCache((req) => {
  return req.params.id || req.params.candidate;
});
