const mongoose = require("mongoose");

const electionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "An election must have a name"],
  },
  // new Date('2020-12-12:06:00:00')
  startDate: {
    type: Date,
    required: [true, "Election must have a start date"],
  },
  endDate: {
    type: Date,
    required: [true, "Election must have a end date"],
  },
  description: {
    type: String,
    required: [true, "Election must have a description"],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  type: {
    type: String,
    required: [true, "Election must have a type"],
    enum: {
      values: ["student", "teacher"],
      message: "Invalid election type",
    },
  },
});

electionSchema.index(
  {
    name: 1,
    startDate: 1,
    endDate: 1,
  },
  {
    unique: true,
  }
);

// add raced? field to verify the election is over
electionSchema.virtual("raced").get(function () {
  return Date.now() > this.endDate;
});

// <TODO> virtual populate the post for a election

electionSchema.virtual;

// <TODO> add slug

const Election = mongoose.model("Election", electionSchema);
module.exports = Election;
