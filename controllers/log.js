const handler = require("../factory/handler");
const Log = require("../models/Log");

exports.getAllLogs = handler.getAll(Log);
exports.getLog = handler.getOne(Log);
exports.createLog = handler.createOne(Log);
exports.updateLog = handler.updateOne(Log);
exports.deleteLog = handler.deleteOne(Log);
