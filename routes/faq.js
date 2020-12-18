const express = require("express");
const router = express.Router({ mergeParams: true });

const faqController = require("../controllers/faq");
const authController = require("../controllers/auth");

router.use(authController.protect, authController.authorize("admin", "mod"));

router
  .route("/")
  .get(faqController.checkCache, faqController.getAllFAQ)
  .post(faqController.creatFAQ);
router
  .route("/:id")
  .get(faqController.getFAQ)
  .patch(faqController.updateFAQ)
  .delete(faqController.deleteFAQ);

module.exports = router;
