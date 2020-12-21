const express = require("express");
const router = express.Router({ mergeParams: true });

const candidateController = require("../controllers/candidate");
const authController = require("../controllers/auth");
const electionController = require("../controllers/election");

router.route("/").get(candidateController.getCandidates);
router.route("/:id").get(candidateController.getCandidate);

router.use(authController.protect, authController.authorize("admin"));
router
  .route("/")
  .post(
    candidateController.convertFileToBuffer,
    candidateController.uploadFile,
    candidateController.createCandidate
  );

router
  .route("/:id")
  .patch(
    candidateController.convertFileToBuffer,
    candidateController.uploadFile,
    candidateController.updateCandidate
  )
  .delete(candidateController.deleteCandidate);

module.exports = router;
