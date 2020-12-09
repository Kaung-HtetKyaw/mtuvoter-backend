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
