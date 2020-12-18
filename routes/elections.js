const express = require("express");
const router = express.Router();
const positionRouter = require("./position");
const candidateRouter = require("./candidate");

const electionController = require("../controllers/election");

router
  .route("/")
  .get(electionController.getALlElections)
  .post(electionController.createElection);
// for GET request, id could be either election id or slug
router
  .route("/:id")
  .patch(electionController.updateElection)
  .get(electionController.checkCache, electionController.getElection)
  .delete(electionController.deleteElection);

router.use("/:election/positions", positionRouter);
router.use("/:election/candidates", candidateRouter);

module.exports = router;
