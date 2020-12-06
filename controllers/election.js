const AppError = require("../utils/AppError");
const { catchAsyncError } = require("../utils/error");
const Election = require("../models/Election");

exports.createElection = catchAsyncError(async (req, res, next) => {});
