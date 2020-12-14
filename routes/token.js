const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const tokenController = require("../controllers/token");

router.use(authController.protect, authController.authorize("admin", "mod"));
router.route("/").post(tokenController.createVoteToken);

module.exports = router;
