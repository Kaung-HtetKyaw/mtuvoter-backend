const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth");

router.route("/signup").post(authController.signup);
router.route("/verify/:token").patch(authController.verify);
router.route("/login").post(authController.login);

module.exports = router;
