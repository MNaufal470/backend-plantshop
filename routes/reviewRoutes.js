const express = require("express");
const router = express();
const {
  getNewReviews,
  writeReview,
} = require("../controller/ReviewController");
const { riviewMiddleware } = require("../middleware/reviewMiddleware");
const { verifyIsLoggedIn } = require("../middleware/verifyAuthToken");

router.get("/", getNewReviews);
router.use(verifyIsLoggedIn);
router.get("/check/:productId", riviewMiddleware);
router.post("/:productId", writeReview);

module.exports = router;
