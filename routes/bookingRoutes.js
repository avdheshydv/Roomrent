const express = require("express");
const router = express.Router();

const {
  createBooking,
  getMyBookings,
  getOwnerRequests,
  updateBookingStatus,
} = require("../controller/bookingController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// Tenant / Student Routes
router.post("/", protect, authorize("tenant"), createBooking);
router.get("/my-bookings", protect, authorize("tenant"), getMyBookings);

// Owner Routes
router.get("/owner-requests", protect, authorize("owner"), getOwnerRequests);
router.put("/:id", protect, authorize("owner"), updateBookingStatus);

module.exports = router;
