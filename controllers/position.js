const mongoose = require("mongoose");
const AppError = require("../utils/AppError");
const { catchAsyncError } = require("../utils/error");
const Election = require("../models/Election");
const Position = require("../models/Post");
const handler = require("../factory/handler");
const Post = require("../models/Post");

exports.createPosition = catchAsyncError(async (req, res, next) => {
  const { name, description } = req.body;
  const position = await Position.create({
    name,
    description,
    _election: req.params.election,
  });
  res.status(201).json({
    status: "success",
    data: position,
  });
});

exports.getPositionsByElection = handler.getAll(Position, (req) => {
  return { _election: mongoose.Types.ObjectId(req.params.election) };
});
exports.updatePosition = handler.updateOne(Position);
exports.deletePosition = handler.deleteOne(Post);

// exports.checkCachePositions = handler.checkCache((req) => {
//   return `election-${req.params.election}-positions`;
// });
