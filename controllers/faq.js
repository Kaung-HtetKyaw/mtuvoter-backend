const mongoose = require("mongoose");
const AppError = require("../utils/AppError");
const { catchAsyncError } = require("../utils/error");
const handler = require("../factory/handler");
const FAQ = require("../models/FAQ");

exports.creatFAQ = handler.createOne(FAQ);
exports.updateFAQ = handler.updateOne(FAQ);
exports.getFAQ = handler.getOne(FAQ);
exports.getAllFAQ = handler.getAll(FAQ);
exports.deleteFAQ = handler.deleteOne(FAQ);
