const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  getAllUsers,
  adminUpdateUser,
  adminDeleteUser,
} = require("../controllers/authController");
const { protect, authorizeAdmin } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);

router.get("/users", protect, authorizeAdmin, getAllUsers);
router.put("/users/:userId", protect, authorizeAdmin, adminUpdateUser);
router.delete("/users/:userId", protect, authorizeAdmin, adminDeleteUser);

module.exports = router;
