const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false,
    },
    phone: {
      type: String,
      required: [true, "Please enter your phone number"],
      trim: true,
    },
    role: {
      type: String,
      enum: {
        values: ["tenant", "owner", "admin"],
        message: "Role must be either tenant, owner, or admin",
      },
      default: "tenant",
    },
    avatar: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    preferences: {
      budgetMax: {
        type: Number,
        default: 10000,
      },
      foodPreference: {
        type: String,
        enum: ["veg", "non-veg", "any"],
        default: "any",
      },
      smoking: {
        type: Boolean,
        default: false,
      },
      sleepingSchedule: {
        type: String,
        enum: ["early_bird", "night_owl", "flexible"],
        default: "flexible",
      },
    },
  },
  {
    timestamps: true,
  },
);


// Modern Mongoose async pre-save hook (bina 'next' parameter ke)
userSchema.pre('save', async function () {
  // Agar password modify nahi hua toh seedha return ho jao
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// 2. Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return false;
  // Agar password bcrypt hash hai ($2a$ ya $2b$)
  if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
    return await bcrypt.compare(enteredPassword, this.password);
  }
  // Fallback: Agar database me plain text password ho
  return enteredPassword === this.password;
};

// 3. JWT Token generation method (Ye line dhyan se dekho)
userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// 4. SABSE LAST MEIN MODEL COMPILE HOGA
module.exports = mongoose.model("User", userSchema);
