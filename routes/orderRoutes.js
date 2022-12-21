const express = require("express");
const router = express();
const {
  getUserOrder,
  getOrder,
  createOrder,
  updateOrderPaid,
  updatedOrderToDelivered,
  getOrders,
  getOrderForAnalysis,
  adminCountDocuments,
} = require("../controller/orderController");
const {
  verifyIsLoggedIn,
  verifyIsAdmin,
} = require("../middleware/verifyAuthToken");
// User Routes

router.use(verifyIsLoggedIn);
router.get("/", getUserOrder);
router.get("/user/:id", getOrder);
router.post("/", createOrder);
router.put("/paid/:id", updateOrderPaid);
// Admin Routes
router.use(verifyIsAdmin);
router.get("/admin/countDocuments", adminCountDocuments);
router.put("/delivered/:id", updatedOrderToDelivered);
router.get("/admin", getOrders);
router.get("/analysis/:date", getOrderForAnalysis);
module.exports = router;
