const mongoose = require("mongoose");
const { isEmail } = require("validator");
const Election = require("./Election");
const Post = require("./Post");

const options = {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
};

const candidateSchema = new mongoose.Schema(
  {
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
      unique: true,
    },
    year: {
      type: String,
      required: [
        true,
        "Please provide the year the candidate is currently attending",
      ],
      enum: {
        values: [
          "first",
          "second",
          "third",
          "fourth",
          "fifth",
          "sixth",
          "others",
        ],
        message: "Invalid school year",
      },
    },
    photo: {
      type: String,
      required: [true, "Please provide candidate photo"],
    },
    major: {
      type: String,
      required: [true, "Please provide the major candiate is attending"],
    },
    promise: {
      type: String,
      required: [
        true,
        "Please provide candidate's election or campaign promise",
      ],
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
  },
  options
);

candidateSchema.path("_election").validate({
  validator: function (value) {
    return Election.exists({ _id: mongoose.Types.ObjectId(value) });
  },
  message: "Cannot find related election",
});

candidateSchema.path("_post").validate({
  validator: function (value) {
    return Post.exists({ _id: mongoose.Types.ObjectId(value) });
  },
  message: "Cannot find related election",
});

const Candidate = mongoose.model("Candidate", candidateSchema);
module.exports = Candidate;
