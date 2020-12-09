const express = require("express");
const router = express.Router({ mergeParams: true });

const candidateController = require("../controllers/candidate");
const authController = require("../controllers/auth");

router
  .route("/")
  .post(
    authController.protect,
    authController.authorize("admin"),
    candidateController.createCandidate
  )
  .get(candidateController.getCandidatesByElection);

module.exports = router;
