const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const tokenController = require("../controllers/token");
const electionController = require("../controllers/election");

router.use(authController.protect, authController.authorize("admin", "mod"));
router
  .route("/")
  .post(
    electionController.raced,
    electionController.started,
    tokenController.createVoteToken
  );

module.exports = router;
