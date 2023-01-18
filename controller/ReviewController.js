const Review = require("../models/ReviewModel");
const Order = require("../models/OrderModel");
const ObjectId = require("mongodb").ObjectId;
const Product = require("../models/ProductModel");
const getNewReviews = async (req, res, next) => {
  const review = await Review.find({})
    .populate("users")
    .sort({ createdAt: -1 })
    .limit(5);
  res.send(review);
};

const writeReview = async (req, res, next) => {
  try {
    let isUserCanReviews = false;
    const user = req.user._id;
    const userTransactions = await Order.find({
      user: ObjectId(user),
    })
      .sort({
        createdAt: "desc",
      })
      .orFail();
    userTransactions.map((item) => {
      item.cartItems.map((pro) => {
        if (pro.productId === req.params.productId) {
          isUserCanReviews = true;
        }
      });
    });
    if (isUserCanReviews) {
      const session = await Review.startSession();
      const { comment, rating } = req.body;
      if (!(comment && rating))
        return res.status(400).send("All inputs are required");
      // Create review id manually
      let reviewId = ObjectId();
      session.startTransaction();
      await Review.create(
        [
          {
            _id: reviewId,
            comment,
            rating: Number(rating),
            users: {
              _id: req.user._id,
              name: req.user.name + " " + req.user.lastName,
              image: req.user.image,
              role: "Member from " + req.user.createdAt.substring(0, 4),
            },
          },
        ],
        { session: session }
      );
      const product = await Product.findById(req.params.productId)
        .populate("reviews")
        .session(session);
      const alreadyReviewed = product.reviews.find(
        (r) => r.users._id.toString() === user.toString()
      );
      if (alreadyReviewed) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).send("product already reviewed");
      }
      let prc = [...product.reviews];
      prc.push({ rating: rating });
      product.reviews.push(reviewId);
      if (product.reviews.length === 1) {
        product.rating = Number(rating);
        product.reviewsNumber = 1;
      } else {
        product.reviewsNumber = product.reviews.length;
        let ratingCalc =
          prc
            .map((item) => Number(item.rating))
            .reduce((sum, item) => sum + item, 0) / product.reviews.length;
        product.rating = Math.round(ratingCalc);
      }

      await product.save();
      await session.commitTransaction();
      session.endSession();
      res.send("review created");
    } else {
      res.json({ message: "user Not Buy The Products" });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { getNewReviews, writeReview };
