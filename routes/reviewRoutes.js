const express = require("express");
const router = express();
const {
  getNewReviews,
  writeReview,
} = require("../controller/ReviewController");
const { verifyIsLoggedIn } = require("../middleware/verifyAuthToken");

router.get("/", getNewReviews);
router.use(verifyIsLoggedIn);
router.post("/:productId", writeReview);

module.exports = router;
