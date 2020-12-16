const express = require("express");
const router = express.Router({ mergeParams: true });

const authController = require("../controllers/auth");
const ballotController = require("../controllers/ballot");

router.get(
  "/candidate-vote-by-student",
  ballotController.getBallotCountForCandidateByStudent
);
router.get(
  "/election-vote-by-student",
  ballotController.getBallotCountForElectionByStudent
);
router.get(
  "/count-by-election/:election",
  ballotController.getBallotCountByElection
);
router.get(
  "/elections/:election/positions/:position",
  ballotController.getBallotCountForCandidateByPosition
);

module.exports = router;
