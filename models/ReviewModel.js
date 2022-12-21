const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema(
  {
    comment: { type: String, required: true },
    rating: { type: Number, required: true },
    users: {
      _id: { type: mongoose.Schema.Types.ObjectId, required: true },
      name: { type: String, required: true },
      image: { type: String, required: true },
      role: { type: String, required: true },
    },
  },
  {
    timestamps: true,
  }
);

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
