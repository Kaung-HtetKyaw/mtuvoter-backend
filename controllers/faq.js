const mongoose = require("mongoose");
const AppError = require("../utils/AppError");
const { catchAsyncError } = require("../utils/error");
const { noop } = require("../utils/utils");
const handler = require("../factory/handler");
const FAQ = require("../models/FAQ");

// exports.checkCache = handler.checkCache((req) => {
//   return "mtuvoter-faq";
// });

exports.creatFAQ = handler.createOne(FAQ);
exports.updateFAQ = handler.updateOne(FAQ);
exports.getFAQ = handler.getOne(FAQ);
exports.getAllFAQ = handler.getAll(FAQ, noop);
exports.deleteFAQ = handler.deleteOne(FAQ);
