const express = require("express");
const router = express.Router();

const { createRoom, getAllRooms } = require("../controller/roomController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// @route   GET /api/rooms
// @desc    Get all available rooms (Public for students/tenants)
router.get("/", getAllRooms);

// @route   POST /api/rooms
// @desc    Create a new room listing (Private - Owner only)
router.post("/", protect, authorize("owner"), createRoom);

module.exports = router;
