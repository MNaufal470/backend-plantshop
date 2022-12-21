const Order = require("../models/OrderModel");
const Product = require("../models/ProductModel");
const User = require("../models/UserModel");
const Category = require("../models/CategoryModel");
const ObjectId = require("mongodb").ObjectId;
const getUserOrder = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: ObjectId(req.user._id) });
    res.send(orders);
  } catch (error) {
    next(error);
  }
};
const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "-password -isAdmin -_id -__v -createdAt -updatedAt")
      .orFail();
    res.send(order);
  } catch (error) {
    next(error);
  }
};
const createOrder = async (req, res, next) => {
  try {
    const { cartItems, orderTotal, paymentMethod } = req.body;
    if (!cartItems || !orderTotal)
      return res.status(400).send("All inputs is required");
    let ids = cartItems.map((item) => item.productID);
    let qty = cartItems.map((item) => item.amount);
    await Product.find({ _id: { $in: ids } }).then((products) => {
      products.forEach(function (product, idx) {
        product.sales += qty[idx];
        product.save();
      });
    });
    const order = new Order({
      user: ObjectId(req.user._id),
      orderTotal: orderTotal,
      cartItems: cartItems,
      paymentMethod: paymentMethod,
    });
    const createdOrder = await order.save();
    res.status(201).send(createdOrder);
  } catch (error) {
    next(error);
  }
};
const updateOrderPaid = async (req, res, next) => {
  try {
    const { paymentMethod } = req.body;
    const order = await Order.findById(req.params.id).orFail();
    if (paymentMethod === "pp") {
      order.paymentMethod = "paypal";
      order.isPaid = true;
      order.paidAt = Date.now();
    } else {
      order.paymentMethod = "cod";
    }
    const updatedOrder = await order.save();
    res.send(updatedOrder);
  } catch (error) {
    next(error);
  }
};
const updatedOrderToDelivered = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).orFail();
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();
    res.send(updatedOrder);
  } catch (error) {
    next(error);
  }
};
const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({}).populate("user", "-password").sort({
      paymentMethod: "desc",
    });
    res.send(orders);
  } catch (error) {
    next(error);
  }
};
const getOrderForAnalysis = async (req, res, next) => {
  try {
    const start = new Date(req.params.date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(req.params.date);
    end.setHours(23, 59, 59, 999);
    const order = await Order.find({
      createdAt: { $gte: start, $lte: end },
    }).sort({ createdAt: "asc" });
    res.send(order);
  } catch (error) {
    next(error);
  }
};

const adminCountDocuments = async (req, res, next) => {
  const userCount = await User.find({}).countDocuments();
  const orderCount = await Order.find({}).countDocuments();
  const productsCount = await Product.find({}).countDocuments();
  const categoryCount = await Category.find({}).countDocuments();
  res.send({
    user: userCount,
    order: orderCount,
    product: productsCount,
    category: categoryCount,
  });
};

module.exports = {
  getUserOrder,
  getOrder,
  createOrder,
  updateOrderPaid,
  updatedOrderToDelivered,
  getOrders,
  getOrderForAnalysis,
  adminCountDocuments,
};
