const express = require("express");
const router = express.Router({ mergeParams: true });
const candidateRouter = require("./candidate");
const positionController = require("../controllers/position");
const electionController = require("../controllers/election");
const authController = require("../controllers/auth");

router.get("/", positionController.getPositionsByElection);

router.use(authController.protect, authController.authorize("admin"));
router.use(electionController.raced, electionController.started);

router.route("/").post(positionController.createPosition);
router
  .route("/:id")
  .delete(positionController.deletePosition)
  .patch(positionController.updatePosition);

router.use("/:position/candidates", candidateRouter);
module.exports = router;
