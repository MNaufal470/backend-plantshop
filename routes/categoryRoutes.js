const express = require("express");
const router = express();
const {
  getAllCategories,
  getCategory,
  addNewCategory,
  deleteCategory,
  categoryImageUpload,
  categoryImageDeleted,
  categoryUpdate,
} = require("../controller/categoryController");
const {
  verifyIsAdmin,
  verifyIsLoggedIn,
} = require("../middleware/verifyAuthToken");

router.get("/", getAllCategories);

router.use(verifyIsLoggedIn);
router.use(verifyIsAdmin);
router.delete("/:id", deleteCategory);
router.get("/:id", getCategory);
router.post("/", addNewCategory);
router.put("/:id", categoryUpdate);

router.put("/image/upload/:id", categoryImageUpload);
router.delete("/image/delete/:imagePath/:categoryId", categoryImageDeleted);

module.exports = router;
