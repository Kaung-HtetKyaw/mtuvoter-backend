const express = require("express");
const router = express.Router({ mergeParams: true });

const candidateController = require("../controllers/candidate");
const authController = require("../controllers/auth");
const electionController = require("../controllers/election");

router.route("/").get(candidateController.getCandidatesByElection);

router.use(authController.protect, authController.authorize("admin"));
router
  .route("/")
  .post(
    candidateController.convertFileToBuffer,
    candidateController.uploadFile,
    candidateController.createCandidate
  )
  .get(candidateController.getCandidatesByElection);
router
  .route("/:id")
  .patch(
    electionController.hasElectionStarted,
    candidateController.convertFileToBuffer,
    candidateController.uploadFile,
    candidateController.updateCandidate
  );

module.exports = router;
