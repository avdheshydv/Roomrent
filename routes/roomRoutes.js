const express = require("express");
const router = express.Router();

const {
  createRoom,
  getAllRooms,
  getSingleRoom,
  updateRoom,
  deleteRoom,
} = require("../controller/roomController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// Collection routes: /api/rooms
router
  .route("/")
  .get(getAllRooms)
  .post(protect, authorize("owner", "admin"), createRoom);

// Single item routes: /api/rooms/:id
router
  .route("/:id")
  .get(getSingleRoom)
  .put(protect, authorize("owner", "admin"), updateRoom)
  .delete(protect, authorize("owner", "admin"), deleteRoom);

module.exports = router;
