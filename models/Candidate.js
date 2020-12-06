const mongoose = require("mongoose");
const { isEmail } = require("validator");

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Provide candidate name"],
    maxlength: 100,
  },
  email: {
    type: String,
    required: [true, "Please provide candidate email address"],
    validate: {
      validator: isEmail,
      message: "Invalid email address",
    },
  },
  social: [
    {
      type: {
        type: String,
      },
      url: String,
    },
  ],
  photo: {
    type: String,
    default: "default.jpg",
  },
  type: {
    type: String,
    default: "student",
    enum: {
      values: ["student", "teacher"],
      message: "Invalid candidate type",
    },
  },
  _election: {
    type: mongoose.Schema.ObjectId,
    ref: "Election",
    required: [true, "Canidate must belong to an election"],
  },
  _post: {
    type: mongoose.Schema.ObjectId,
    ref: "Post",
    required: [true, "Candidate must belong to a position"],
  },
});

const Candidate = mongoose.model("Candidate", candidateSchema);
module.exports = Candidate;
