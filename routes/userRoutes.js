const express = require("express");
const router = express();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  updateImageProfile,
  editImageProfile,
  getAllUsers,
  getUser,
  adminUpdateUser,
  adminDeleteUser,
} = require("../controller/userController");
const {
  verifyIsLoggedIn,
  verifyIsAdmin,
} = require("../middleware/verifyAuthToken");
const jwt = require("jsonwebtoken");

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/logout", (req, res) => {
  return res.clearCookie("access_token").send("access token cleared");
});
// user routes
router.use(verifyIsLoggedIn);
router.get("/profile/:id", getUserProfile);
router.put("/profile/:id", updateUserProfile);
router.post("/profile/imageProfile/upload/:id", updateImageProfile);
router.put("/profile/imageProfile/edit/:id/:imagePath", editImageProfile);

//  Admin Routes
router.use(verifyIsAdmin);
router.get("/", getAllUsers);
router.get("/:id", getUser);
router.put("/:id", adminUpdateUser);
router.delete("/:id", adminDeleteUser);

module.exports = router;
