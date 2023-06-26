const path = require("path");
const { StatusCodes } = require("http-status-codes");
const CustomErr = require("../errors");
const Product = require("../models/Product");
const createProduct = async (req, res) => {
  req.body.user = req.user.userId;
  const product = await Product.create(req.body);

  res.status(StatusCodes.CREATED).json({ product });
};
const getAllProducts = async (req, res) => {
  const products = await Product.find({});
  res.status(StatusCodes.OK).json({ count: products.length, products });
  // res.send("get all products");
};
const getSingleProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOne({ _id: productId }).populate("reviews");

  if (!product) {
    throw new CustomErr.NotFoundError("Product not found");
  }
  res.status(StatusCodes.OK).json({ product });
  // res.send("get single product");
};
const updateProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOneAndUpdate({ _id: productId }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    throw new CustomErr.NotFoundError(
      `product not found with id: ${productId}`
    );
  }
  res.status(StatusCodes.OK).json({ product });
};
const deleteProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOne({ _id: productId });
  if (!product) {
    throw new CustomErr("Product not found");
  }
  await product.remove();
  res.status(StatusCodes.OK).json({ msg: "Success! product removed" });
};
const uploadImage = async (req, res) => {
  if (!req.files) {
    throw new CustomErr.BadRequestError("no file upload");
  }
  const productImage = req.files.image;
  if (!productImage.mimetype.startsWith("image")) {
    throw new CustomErr.BadRequestError("Please upload image");
  }
  const maxsize = 1024 * 1024;
  if (productImage.size > maxsize) {
    throw new CustomErr.BadRequestError("image oversized");
  }
  const imagePath = path.join(
    __dirname,
    "../public/uploads/" + `${productImage.name}`
  );
  await productImage.mv(imagePath);
  res.status(StatusCodes.OK).json({ image: `/uploads/${productImage.name}` });
};

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};
