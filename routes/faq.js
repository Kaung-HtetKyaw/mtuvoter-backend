const express = require("express");
const router = express.Router({ mergeParams: true });

const faqController = require("../controllers/faq");
const authController = require("../controllers/auth");

router.route('/').get(faqController.getAllFAQ)
router.use(authController.protect, authController.authorize("admin", "mod"));

router
  .route("/")
  .post(faqController.creatFAQ);
router
  .route("/:id")
  .get(faqController.getFAQ)
  .patch(faqController.updateFAQ)
  .delete(faqController.deleteFAQ);

module.exports = router;
