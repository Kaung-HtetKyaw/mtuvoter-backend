const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, "Please provide a question"],
  },
  by: {
    type: String,
    required: [true, "Please provide the person who did the action"],
  },
  resource: {
    type: String,
    required: [true, "Please provide the resource"],
  },

  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Log = mongoose.model("Log", logSchema);
module.exports = Log;
