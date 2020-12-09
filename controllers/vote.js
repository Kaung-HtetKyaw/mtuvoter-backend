const mongoose = require("mongoose");
const { catchAsyncError } = require("../utils/utils");
const AppError = require("../utils/AppError");
const Ballot = require("../models/Ballot");

exports.vote = catchAsyncError(async (req, res, next) => {});
