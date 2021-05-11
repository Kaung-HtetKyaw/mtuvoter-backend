const express = require("express");
const router = express.Router({ mergeParams: true });

const newsController = require("../controllers/news");
const authController = require("../controllers/auth");

router.get("/",authController.includeUserInfo, newsController.getAllNews);
router.get("/:id", newsController.getNews);

router.use(authController.protect, authController.authorize("admin", "mod"));
router.route("/:id/publish")
      .patch(newsController.publishNews);
router.route("/:id/unpublish")
      .patch(newsController.unpublishNews)

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
