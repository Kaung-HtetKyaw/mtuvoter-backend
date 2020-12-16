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
      required: [true, "Please provide candidate photo"],
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
