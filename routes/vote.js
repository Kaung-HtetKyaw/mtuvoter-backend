const express = require("express");
const router = express.Router();

const voteController = require("../controllers/vote");
const electionController = require("../controllers/election");
const authController = require('../controllers/auth')

router
  .route("/")
  .post(
    authController.includeUserInfo,
    electionController.raced,
    electionController.notStarted,
    voteController.checkVoteToken,
    voteController.hasVoted,
    voteController.checkVotedElection,
    voteController.vote
  );

module.exports = router;
