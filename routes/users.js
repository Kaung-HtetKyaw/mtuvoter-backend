const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth");
const userController = require("../controllers/user");
const voteController = require("../controllers/vote");

router.route("/signup").post(authController.signup);
router.route("/verify/:token").patch(authController.verify);
router.route("/login").post(authController.login);
router.route("/logout").get(authController.protect, authController.logout);
router.route("/forgot").post(authController.forgotPassword);
router.route("/reset/:token").patch(authController.resetPassword);
router
  .route("/pass")
  .patch(authController.updatePassword)
  .post(authController.forgotPassword);
router.route("/guest").post(authController.guestLogin);
router.route("/vote-status/elections/:election/positions/:position")
  .get(voteController.checkVoteToken,userController.getVoteStatus);

router.use(authController.protect);
router
  .route("/me")
  .patch(userController.updateMe)
  .get(userController.getMe, userController.getUser);

router.use(authController.authorize("admin"));
router
  .route("/roles")
  .post(userController.addMod)
  .patch(userController.removeMod);
router.get("/authorities", userController.getAuthorities);
router.route("/").get(userController.getUsers);
router.route("/:id").delete(userController.deleteUser);

module.exports = router;
