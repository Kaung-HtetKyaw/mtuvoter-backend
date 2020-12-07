const express = require("express");
const router = express.Router();

const electionController = require("../controllers/election");

router.route("/").post(electionController.createElection);
// for GET request, id could be either election id or slug
router
  .route("/:id")
  .patch(electionController.updateElection)
  .get(electionController.getElection);

module.exports = router;
