const mongoose = require("mongoose");
const { STUDENT_TYPE } = require("../utils/constants");
const Realtime = require("../services/Pusher");

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
  student_type: {
    type: String,
    required: [true, "Provide the current year you are attending"],
    enum: {
      values: STUDENT_TYPE,
      message: "Invalid student year",
    },
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

ballotSchema.post("save", async function (doc) {
  const { _election, _post, _candidate } = doc;
  Realtime.trigger("vote-result", "new-vote", {
    _election,
    _post,
    _candidate,
  });
});

const Ballot = mongoose.model("Ballot", ballotSchema);
module.exports = Ballot;
