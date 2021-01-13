const AppError = require("../utils/AppError");
const { catchAsyncError } = require("../utils/error");
const Election = require("../models/Election");
const handler = require("../factory/handler");

const Storage = require("../services/Storage/Storage");
const storage = new Storage({ width: 500, height: 500 });
const multerUpload = storage.createMulterUpload();

exports.convertFileToBuffer = multerUpload.single("photo");

exports.uploadFile = handler.uploadFile(storage, "elections", Election);

exports.createElection = handler.createOne(Election);
exports.updateElection = handler.updateOne(Election, true);
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
  const electionId = req.body.election || req.params.id;
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

exports.raced = catchAsyncError(async (req, res, next) => {
  const electionID = req.body.election || req.params.election;
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
