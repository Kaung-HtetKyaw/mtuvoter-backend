const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, "Please provide a question"],
  },
  answer: {
    type: String,
    required: [true, "Please provide an answer"],
  },
});

const FAQ = mongoose.model("FAQ", faqSchema);
module.exports = FAQ;
