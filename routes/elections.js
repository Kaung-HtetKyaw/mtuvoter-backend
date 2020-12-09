const express = require("express");
const router = express.Router();
const positionRouter = require("./position");

const electionController = require("../controllers/election");

router
  .route("/")
  .get(electionController.getALlElections)
  .post(electionController.createElection);
// for GET request, id could be either election id or slug
router
  .route("/:id")
  .patch(electionController.updateElection)
  .get(electionController.getElection)
  .delete(electionController.deleteElection);

router.use("/:election/positions", positionRouter);

module.exports = router;
