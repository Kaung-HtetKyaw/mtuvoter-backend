const express = require("express");
const router = express.Router();

const voteController = require("../controllers/vote");
const electionController = require("../controllers/election");

router
  .route("/")
  .post(
    electionController.raced,
    electionController.notStarted,
    voteController.checkVoteToken,
    voteController.hasVoted,
    voteController.vote
  );

module.exports = router;
