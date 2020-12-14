const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth");
const userController = require("../controllers/user");
const voteController = require("../controllers/vote");

router.route("/signup").post(authController.signup);
router.route("/verify/:token").patch(authController.verify);
router.route("/login").post(authController.login);
router.route("/forgot").post(authController.forgotPassword);
router.route("/reset/:token").patch(authController.resetPassword);
router.route("/updatePassword").patch(authController.updatePassword);
router.route("/guest").get(authController.guestLogin);

router.use(authController.protect);
router
  .route("/me")
  .patch(
    userController.convertFileToBuffer,
    userController.uploadFile,
    userController.updateMe
  );
router.route("/vote-status").get(userController.getVoteStatus);

module.exports = router;
