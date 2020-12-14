const mongoose = require("mongoose");
const Election = require("./Election");

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

// checking ref election here because it's much more efficient than checking at ballot
postSchema.path("_election").validate({
  validator: function (value) {
    return Election.exists({ _id: mongoose.Types.ObjectId(value) });
  },
  message: "Cannot find related election",
});

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
