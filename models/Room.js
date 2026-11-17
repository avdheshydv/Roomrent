const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a room title"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Please provide a room description"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    rent: {
      type: Number,
      required: [true, "Please specify monthly rent amount"],
      min: [0, "Rent cannot be negative"],
    },
    securityDeposit: {
      type: Number,
      default: 0,
    },
    roomType: {
      type: String,
      required: [true, "Please select room type"],
      enum: ["Single", "Shared", "1RK", "1BHK", "2BHK", "3BHK"],
    },
    location: {
      address: {
        type: String,
        required: [true, "Please provide street address/area"],
        trim: true,
      },
      city: {
        type: String,
        required: [true, "Please specify city"],
        trim: true,
        lowercase: true,
      },
      pincode: {
        type: String,
        trim: true,
      },
    },
    amenities: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Room", roomSchema);
