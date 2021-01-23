const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth");
const logController = require("../controllers/log");

router.use(authController.protect, authController.authorize("admin"));
router.route("/").get(logController.getAllLogs);

module.exports = router;
