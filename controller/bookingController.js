const Booking = require("../models/Booking");
const Room = require("../models/Room");

// @desc    Create a new room booking/visit request
// @route   POST /api/bookings
// @access  Private (Tenant/Student only)
const createBooking = async (req, res) => {
  try {
    const { roomId, moveInDate, message } = req.body;

    // 1. Check karo room exist karta hai aur available hai ya nahi
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    if (!room.isAvailable) {
      return res.status(400).json({
        success: false,
        message: "This room is already booked or unavailable",
      });
    }

    // 2. Spam / Duplicate Prevention: Kya student ne pehle se pending request bheji hai?
    const existingBooking = await Booking.findOne({
      room: roomId,
      tenant: req.user._id,
      status: "pending",
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending booking request for this room",
      });
    }

    // 3. Create Booking (Owner ID database ke room document se secure li gayi hai)
    const booking = await Booking.create({
      room: room._id,
      tenant: req.user._id,
      owner: room.owner,
      moveInDate,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Booking request sent to owner successfully",
      data: booking,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all bookings sent by logged-in tenant
// @route   GET /api/bookings/my-bookings
// @access  Private (Tenant only)
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ tenant: req.user._id })
      .populate("room", "title rent roomType location")
      .populate("owner", "name phone email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all booking requests received by logged-in owner
// @route   GET /api/bookings/owner-requests
// @access  Private (Owner only)
const getOwnerRequests = async (req, res) => {
  try {
    const requests = await Booking.find({ owner: req.user._id })
      .populate("room", "title rent location isAvailable")
      .populate("tenant", "name phone email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Approve or Reject a booking request
// @route   PUT /api/bookings/:id
// @access  Private (Owner of the room only)
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'approved' or 'rejected'",
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking request not found",
      });
    }

    // OWNERSHIP CHECK: Sirf wahi owner approve/reject kar sakta hai jiske room ki request hai
    if (booking.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to respond to this booking request",
      });
    }

    booking.status = status;
    await booking.save();

    // Bonus Real-World Logic: Agar booking approve ho gayi, toh room ko unavailable mark karo
    if (status === "approved") {
      await Room.findByIdAndUpdate(booking.room, { isAvailable: false });
    }

    res.status(200).json({
      success: true,
      message: `Booking request ${status}`,
      data: booking,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getOwnerRequests,
  updateBookingStatus,
};
