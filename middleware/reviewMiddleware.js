const Order = require("../models/OrderModel");
const Product = require("../models/ProductModel");
const ObjectId = require("mongodb").ObjectId;
const riviewMiddleware = async (req, res, next) => {
  try {
    const user = req.user._id;
    const userTransactions = await Order.find({
      user: ObjectId(user),
    })
      .sort({
        createdAt: "desc",
      })
      .orFail();
    let isUserCanReviews = false;
    let reviewed = false;
    userTransactions.map((item) => {
      item.cartItems.map(async (pro) => {
        if (pro.productId === req.params.productId) {
          isUserCanReviews = true;
        }
      });
    });
    if (isUserCanReviews) {
      const product = await Product.findById(req.params.productId).populate(
        "reviews"
      );
      const alreadyReviewed = product.reviews.find(
        (r) => r.users._id.toString() === user.toString()
      );
      if (alreadyReviewed) {
        reviewed = true;
        isUserCanReviews = false;
      }
    }
    res.send({ status: isUserCanReviews, reviewed });
  } catch (error) {
    next(error);
  }
};

module.exports = { riviewMiddleware };
