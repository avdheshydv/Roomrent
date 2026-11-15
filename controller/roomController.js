const Room = require("../models/Room");

// @desc    Create a new room listing
// @route   POST /api/rooms
// @access  Private (Owner / Admin only)
const createRoom = async (req, res) => {
  try {
    // 0. Double Guard: Ensure only 'owner' or 'admin' can create listings
    const userRole = req.user && req.user.role ? req.user.role.toLowerCase().trim() : "";
    if (userRole !== "owner" && userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Only 'owner' or 'admin' accounts can create room listings. Your current role is '${req.user ? req.user.role : "None"}'.`,
      });
    }

    // 1. Logged-in user ki ID ko room ke owner field me inject karo
    const roomData = {
      ...req.body,
      owner: req.user._id,
    };

    // 2. Database me room save karo
    const room = await Room.create(roomData);

    res.status(201).json({
      success: true,
      message: "Room listed successfully",
      data: room,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all available rooms with optional filters
// @route   GET /api/rooms
// @access  Public
const getAllRooms = async (req, res) => {
  try {
    const { city, roomType, minRent, maxRent } = req.query;

    // Filter object dynamically build karo
    let query = { isAvailable: true };

    if (city) {
      query["location.city"] = city.toLowerCase();
    }

    if (roomType) {
      query.roomType = roomType;
    }

    if (minRent || maxRent) {
      query.rent = {};
      if (minRent) query.rent.$gte = Number(minRent);
      if (maxRent) query.rent.$lte = Number(maxRent);
    }

    // .populate() se owner ka name, phone aur email join ho jayega
    const rooms = await Room.find(query)
      .populate("owner", "name phone email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single room by ID
// @route   GET /api/rooms/:id
// @access  Public
const getSingleRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate(
      "owner",
      "name phone email role"
    );

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room listing not found",
      });
    }

    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        message: "Invalid Room ID",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update room details
// @route   PUT /api/rooms/:id
// @access  Private (Owner of the room or Admin only)
const updateRoom = async (req, res) => {
  try {
    let room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Authorization: Sirf wahi owner jisne room banaya tha ya fir admin hi update kar sakta hai
    if (
      room.owner.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this room listing",
      });
    }

    room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("owner", "name phone email role");

    res.status(200).json({
      success: true,
      message: "Room updated successfully",
      data: room,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        message: "Invalid Room ID",
      });
    }
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete a room listing
// @route   DELETE /api/rooms/:id
// @access  Private (Owner of the room or Admin only)
const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Authorization: Sirf wahi owner jisne room banaya tha ya fir admin hi delete kar sakta hai
    if (
      room.owner.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this room listing",
      });
    }

    await Room.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Room listing deleted successfully",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        message: "Invalid Room ID",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createRoom,
  getAllRooms,
  getSingleRoom,
  updateRoom,
  deleteRoom,
};
