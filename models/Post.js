const mongoose = require("mongoose");

const options = {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
};

const postSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Postion must have a name"],
    },
    description: {
      type: String,
      required: [true, "Postion must have a description"],
    },
    _election: {
      type: mongoose.Schema.ObjectId,
      ref: "Election",
      required: [true, "A Postion must belong to an election"],
    },
  },
  options
);

postSchema.index({
  name: 1,
});

postSchema.index(
  {
    name: 1,
    _election: 1,
  },
  {
    unique: true,
  }
);

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
