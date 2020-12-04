const mongoose = require("mongoose");

const ballotSchema = new mongoose.Schema({
  _voter: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Ballot must have an user"],
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
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Ballot = mongoose.model("Ballot", ballotSchema);
