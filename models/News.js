const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please provide a title"],
  },
  content: {
    type: String,
    required: [true, "Please provide the details"],
  },
  photo: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const News = mongoose.model("New", newsSchema);
module.exports = News;
