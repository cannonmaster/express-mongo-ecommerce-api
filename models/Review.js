const mongoose = require("mongoose");

const ReviewSchema = mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "please provide rating"],
    },
    title: {
      type: String,
      trim: true,
      required: [true, "please provide review title"],
    },
    comment: {
      type: String,
      required: [true, "please provide review text"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
ReviewSchema.index({ product: 1, user: 1 }, { required: true });
ReviewSchema.statics.calculateAverageRating = async function (productId) {
  const res = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        numberOfReviews: { $sum: 1 },
      },
    },
  ]);
  try {
    await this.model("Product").findOneAndUpdate(
      {
        _id: productId,
      },
      {
        averageRating: Math.ceil(res[0]?.averageRating || 0),
        numberOfReviews: res[0]?.numberOfReviews || 0,
      }
    );
  } catch (error) {
    console.log(error);
  }
};
ReviewSchema.post("save", async function () {
  await this.constructor.calculateAverageRating(this.product);
});
ReviewSchema.post("remove", async function () {});

module.exports = mongoose.model("Review", ReviewSchema);
