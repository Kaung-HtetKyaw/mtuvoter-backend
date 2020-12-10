const mongoose = require("mongoose");

const ballotSchema = new mongoose.Schema({
  _v_t: {
    type: mongoose.Schema.ObjectId,
    ref: "Token",
    required: [true, "Ballot must have a token"],
  },
  _post: {
    type: mongoose.Schema.ObjectId,
    ref: "Post",
    required: [true, "Ballot must have a position"],
  },
  _election: {
    type: mongoose.Schema.ObjectId,
    ref: "Election",
    required: [true, "Ballot must belong to an election"],
  },
  _candidate: {
    type: mongoose.Schema.ObjectId,
    ref: "Candidate",
    required: [true, "Ballot must be vote for a candidate"],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

ballotSchema.index(
  {
    _v_t: 1,
    _election: 1,
    _post: 1,
  },
  {
    unique: true,
  }
);

const Ballot = mongoose.model("Ballot", ballotSchema);
module.exports = Ballot;
