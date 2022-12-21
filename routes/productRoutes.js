const express = require("express");
const router = express();
const {
  adminGetProducts,
  getDetailProduct,
  adminCreateProducts,
  adminUploadImages,
  adminDeleteImage,
  adminDeleteProducts,
  adminUpdateProduct,
  getProducts,
  getProductBy,
  getRelatedProduct,
} = require("../controller/productController");
const {
  verifyIsAdmin,
  verifyIsLoggedIn,
} = require("../middleware/verifyAuthToken");

router.get("/", getProducts);
router.get("/search/:searchQuery", getProducts);
router.get("/category/:categoryName", getProducts);
router.get("/category/:categoryName/search/:searchQuery", getProducts);
router.get("/:id", getDetailProduct);

router.get("/spesial/getProductBy", getProductBy);
router.get("/spesial/relatedProduct/:category", getRelatedProduct);

// Admin Routes
router.use(verifyIsLoggedIn);
router.use(verifyIsAdmin);
router.put("/:productId", adminUpdateProduct);
router.get("/admin/products", adminGetProducts);
router.post("/", adminCreateProducts);
router.delete("/:productId", adminDeleteProducts);
router.put("/images/upload/:productId", adminUploadImages);
router.put("/images/delete/:pathImage/:productId", adminDeleteImage);

module.exports = router;
