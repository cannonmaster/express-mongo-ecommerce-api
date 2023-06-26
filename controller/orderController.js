const { StatusCodes } = require("http-status-codes");
const CustomErr = require("../errors");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { checkPermission } = require("../utils");

const getAllOrders = async (req, res) => {
  // const {items}
  const orders = await Order.find({});
  res.status(StatusCodes.OK).json({ count: orders.length, orders });
};
const getSingleOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new CustomErr.NotFoundError("order with id not found");
  }

  checkPermission(req.user, order.user);
  res.status(StatusCodes.OK).json({ order });
};
const getCurrentUserOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.userId });
  res.status(StatusCodes.OK).json({ count: orders.length, orders });
};

const fakeStripeApi = async ({ amount, currency }) => {
  const client_secret = "key";
  return { client_secret, amount };
};
const createOrder = async (req, res) => {
  const { items: cartItems, tax, shippingFee } = req.body;

  if (!cartItems || cartItems.length === 0) {
    throw new CustomErr.BadRequestError("cart items not provided");
  }
  if (!shippingFee || !tax) {
    throw new CustomErr.BadRequestError("shipping and tax not provided");
  }

  let orderItems = [];
  let subtotal = 0;

  for (const item of cartItems) {
    const product = await Product.findOne({ _id: item.product });
    if (!product) {
      throw new CustomErr.NotFoundError("product with id not found");
    }
    const { name, price, image, _id } = product;
    const singleOrderItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id,
    };

    orderItems = [...orderItems, singleOrderItem];

    subtotal += price * item.amount;
  }

  const total = tax + shippingFee + subtotal;

  const paymentIntent = await fakeStripeApi({
    amount: total,
    currency: "usd",
  });

  const order = await Order.create({
    orderItems,
    total,
    subtotal,
    tax,
    shippingFee,
    clientSecret: paymentIntent.client_secret,
    user: req.user.userId,
  });

  res
    .status(StatusCodes.CREATED)
    .json({ order, clientSecret: order.clientSecret });
};
const updateOrder = async (req, res) => {
  const { paymentIntentId } = req.body;
  console.log(paymentIntentId);
  const { id: orderId } = req.params;
  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new CustomErr.NotFoundError("order with id not found");
  }

  checkPermission(req.user, order.user);
  order.paymentIntentId = paymentIntentId;
  order.status = "paid";
  await order.save();
  res.status(StatusCodes.OK).json({ order });
};

module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
};
