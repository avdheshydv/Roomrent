const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: [true, "Room ID is required"],
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Tenant ID is required"],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner ID is required"],
    },
    moveInDate: {
      type: Date,
      required: [true, "Expected move-in date is required"],
    },
    message: {
      type: String,
      trim: true,
      maxlength: [300, "Message cannot exceed 300 characters"],
      default: "Hi, I am interested in renting this room.",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Booking", bookingSchema);
    