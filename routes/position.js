const express = require("express");
const router = express.Router({ mergeParams: true });
const candidateRouter = require("./candidate");
const positionController = require("../controllers/position");
const authController = require("../controllers/auth");

router
  .route("/")
  .post(positionController.createPosition)
  .get(
    positionController.checkCachePositions,
    positionController.getPositionsByElection
  );
router
  .route("/:id")
  .delete(
    authController.protect,
    authController.authorize("admin"),
    positionController.deletePosition
  )
  .patch(
    authController.protect,
    authController.authorize("admin"),
    positionController.updatePosition
  );

router.use("/:position/candidates", candidateRouter);
module.exports = router;
