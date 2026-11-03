const express = require("express");
const router = express.Router();

// 1. Controllers import karo
const { register, login, getMe } = require("../controller/authController");

// 2. Auth middleware se protect import karo
const { protect } = require("../middleware/authMiddleware");

// Public routes (Koi bhi access kar sakta hai)
router.post("/register", register);
router.post("/login", login);

// Protected route (Bina valid JWT token ke access block ho jayega)
router.get("/me", protect, getMe);

module.exports = router;
