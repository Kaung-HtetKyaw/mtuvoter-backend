const express = require("express");
const router = express.Router({ mergeParams: true });
const testController = require("../controllers/test");

router
  .route("/upload")
  .post(testController.multerBuffer, testController.uploadImage)
  .patch(testController.multerBuffer, testController.updateImage);

module.exports = router;
