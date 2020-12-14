const express = require("express");
const router = express.Router();

const voteController = require("../controllers/vote");

router
  .route("/")
  .post(
    voteController.raced,
    voteController.checkVoteToken,
    voteController.hasVoted,
    voteController.vote
  );

module.exports = router;
