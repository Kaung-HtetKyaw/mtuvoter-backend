// voter token for guest user
const mongoose = require("mongoose");
const { days } = require("../utils/time");

const tokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: [true, "Please provide a token"],
  },
  SID: {
    type: String,
    required: [true, "Please provide student id"],
  },
  _election: {
    type: mongoose.Schema.ObjectId,
    required: [true, "Token must belong to an election"],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

tokenSchema.index(
  {
    SID: 1,
    _election: 1,
  },
  {
    unique: true,
  }
);

const Token = mongoose.model("Token", tokenSchema);
module.exports = Token;
