// voter token for guest user
const mongoose = require("mongoose");
const { days } = require("../utils/time");

const tokenSchema = new mongoose.Schema({
  token: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});


const Token = mongoose.model("Token", tokenSchema);
module.exports = Token;
