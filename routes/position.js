const express = require("express");
const router = express.Router({ mergeParams: true });
const candidateRouter = require("./candidate");
const positionController = require("../controllers/position");

router
  .route("/")
  .post(positionController.createPosition)
  .get(positionController.getPositionsByElection);
router.route("/:id").delete(positionController.deletePosition);

router.use("/:position/candidates", candidateRouter);
module.exports = router;
