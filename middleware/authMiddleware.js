const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  // Step 1: Check karo request ke header me token aaya hai ya nahi
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Step 2: "Bearer <token>" me se sirf token ko bahar nikalo
      token = req.headers.authorization.split(" ")[1];

      // Step 3: Secret key se token ko decrypt/verify karo
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Step 4: Token me se User ID nikaal kar database se user dhoondo
      req.user = await User.findById(decoded.id).select("-password");

      // Step 5: User mil gaya, ab aage badho
      return next();
    } catch (error) {
      console.error("Token verification failed:", error.message);
      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed or expired",
      });
    }
  }

  // Step 6: Agar header me token tha hi nahi
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token provided",
    });
  }
};

module.exports = { protect };
