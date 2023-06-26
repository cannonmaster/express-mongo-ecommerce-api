const Review = require("../models/Review");
const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const CustomErr = require("../errors");
const { checkPermission } = require("../utils");
const createReview = async (req, res) => {
  const { product: productId } = req.body;
  const isValidProduct = await Product.findOne({ _id: productId });
  if (!isValidProduct) {
    throw new CustomErr.NotFoundError("product not found");
  }
  const alreadySubmitted = await Review.findOne({
    product: productId,
    user: req.user.userId,
  });
  if (alreadySubmitted) {
    throw new CustomErr.BadRequestError("review with the user already exists");
  }
  req.body.user = req.user.userId;
  const review = await Review.create(req.body);
  res.status(StatusCodes.CREATED).json({ review });
};

const getAllReviews = async (req, res) => {
  const reviews = await Review.find({}).populate({
    path: "product",
    select: "name price company",
  });
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

const getSingleReview = async (req, res) => {
  const reviewId = req.params.id;
  const review = await Review.findOne({ _id: reviewId });
  if (!review) {
    throw new CustomErr.NotFoundError("review with the id not exists");
  }
  res.status(StatusCodes.OK).json({ review });
};

const updateReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const { comment, title, rating } = req.body;
  const review = await Review.findOne({ _id: reviewId });

  if (!review) {
    throw new CustomErr.NotFoundError("review with id not found to update");
  }

  checkPermission(req.user, review.user);
  review.rating = rating;
  review.title = title;
  review.comment = comment;
  await review.save();
  res.status(StatusCodes.OK).json({ msg: "success, review updated" });
};

const deleteReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const review = await Review.findOne({ _id: reviewId });
  if (!review) {
    throw new CustomErr.NotFoundError("review with id not found");
  }
  checkPermission(req.user, review.user);
  await review.remove();
  res.status(StatusCodes.OK).json({ msg: "review deleted" });
};
const getSinglelProductReviews = async (req, res) => {
  const { id: productId } = req.params;

  const reviews = await Review.find({ product: productId });
  res.status(StatusCodes.OK).json({ count: reviews.length, reviews });
};
module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  getSinglelProductReviews,
};
