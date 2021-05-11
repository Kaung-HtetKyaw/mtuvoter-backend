const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please provide a title"],
  },
  description: {
    type: String,
    required: [true, "Please provide description for news"],
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
  published:{
    type:Boolean,
    default:false
  }
});

const News = mongoose.model("New", newsSchema);
module.exports = News;
