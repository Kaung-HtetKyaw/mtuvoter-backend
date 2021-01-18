const express = require("express");
const router = express.Router({ mergeParams: true });

const newsController = require("../controllers/news");
const authController = require("../controllers/auth");

router.get("/", newsController.getAllNews);
router.get("/:id", newsController.getNews);

router.use(authController.protect, authController.authorize("admin", "mod"));
router
  .route("/")
  .post(
    newsController.convertFileToBuffer,
    newsController.uploadFile,
    newsController.createNews
  );
router
  .route("/:id")
  .patch(
    newsController.convertFileToBuffer,
    newsController.uploadFile,
    newsController.updateNews
  )
  .delete(newsController.deleteNews);

module.exports = router;
