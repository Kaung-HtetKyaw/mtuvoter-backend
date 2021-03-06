const express = require("express");
const router = express.Router();
const positionRouter = require("./position");
const candidateRouter = require("./candidate");

const electionController = require("../controllers/election");
const authController = require("../controllers/auth");

router
  .route("/")
  .get(authController.includeUserInfo,electionController.getALlElections)
  .post(
    authController.protect,
    authController.authorize("admin"),
    electionController.createElection
  );
router.get(
  "/latest-raced-election",
  authController.protect,
  authController.authorize("admin"),
  electionController.getLatestElection
);
// for GET request, id could be either election id or slug
router.route('/:id/publish')
      .patch(
        authController.protect,
        authController.authorize("admin","mod"),
        electionController.publishElection
        )
router.route('/:id/unpublish')
      .patch(
        authController.protect,
        authController.authorize("admin","mod"),
        electionController.unpublishElection
        )
router
  .route("/:id")
  .patch(
    authController.protect,
    authController.authorize("admin"),
    electionController.updateElection
  )
  .get(authController.includeUserInfo,electionController.getElection)
  .delete(
    authController.protect,
    authController.authorize("admin"),
    electionController.deleteElection
  );

router.use("/:election/positions", positionRouter);
router.use("/:election/candidates", candidateRouter);

module.exports = router;
