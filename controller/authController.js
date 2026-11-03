const User = require("../model/User");

// Helper function: User create/login hone par JWT token generate karke response bhejna
const sendTokenResponse = (user, statusCode, res) => {
  // Model me banaya hua method call kiya
  const token = user.generateAuthToken();

  // User object se password field ensure karke delete kar do taaki response me na jaye
  const userData = user.toObject();
  delete userData.password;

  res.status(statusCode).json({
    success: true,
    message: "User authenticated successfully",
    token,
    user: userData,
  });
};

// @desc    Register a new user (tenant / owner)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role, preferences } = req.body;

    // 1. Check karo ki user ne saare mandatory fields diye hain ya nahi
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, password, and phone number",
      });
    }

    // 2. Check karo ki is email se pehle koi user exist karta hai ya nahi
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // 3. Naya user create karo
    // Note: Password hash User.js ke pre('save') hook se automatically ho jayega
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || "tenant", // Default role tenant rahega
      preferences: preferences || {},
    });

    // 4. Token generate karke 201 Created response bhejo
    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error during registration",
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check karo ki email aur password dono diye hain ya nahi
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide an email and password",
      });
    }

    // 2. User ko find karo (password select: false hai schema mein, isliye +password lagana zaroori hai)
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 3. Password match check karo
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 4. Token generate karke 200 OK response bhejo
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error during login",
    });
  }
};
