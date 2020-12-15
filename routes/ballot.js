const express = require("express");
const router = express.Router({ mergeParams: true });

const authController = require("../controllers/auth");
const ballotController = require("../controllers/ballot");

router
  .route("/candidate-vote-by-student")
  .get(ballotController.getBallotCountForCandidateByStudent);

module.exports = router;
