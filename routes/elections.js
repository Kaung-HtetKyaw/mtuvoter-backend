const express = require("express");
const router = express.Router();
const positionRouter = require("./position");
const candidateRouter = require("./candidate");

const electionController = require("../controllers/election");
const authController = require("../controllers/auth");

router
  .route("/")
  .get(electionController.getALlElections)
  .post(
    electionController.convertFileToBuffer,
    electionController.uploadFile,
    authController.protect,
    authController.authorize("admin"),
    electionController.createElection
  );
// for GET request, id could be either election id or slug
router
  .route("/:id")
  .patch(
    authController.protect,
    authController.authorize("admin"),
    electionController.updateElection
  )
  .get(electionController.getElection)
  .delete(
    authController.protect,
    authController.authorize("admin"),
    electionController.deleteElection
  );

router.use("/:election/positions", positionRouter);
router.use("/:election/candidates", candidateRouter);

module.exports = router;
