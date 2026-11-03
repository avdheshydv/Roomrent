const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  // Step 1: Check karo request ke header me token aaya hai ya nahi
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.trim().toLowerCase().startsWith("bearer")) {
    try {
      // Step 2: "Bearer" prefix aur surrounding quotes/spaces clean karo
      let cleanHeader = authHeader.trim().replace(/^["']|["']$/g, "").trim();

      // Handle duplicate "Bearer" prefixes (e.g. Postman Auth tab adding "Bearer" on top of "Bearer ...")
      token = cleanHeader.replace(/^(Bearer\s*)+/i, "").trim();

      // Remove any quotes, angle brackets (< >), or curly brackets ({ }) around the token
      token = token.replace(/^[<{"']+|[>}"']+$/g, "").trim();

      // Step 3: Check if token exists and is not a placeholder
      if (
        !token ||
        token === "undefined" ||
        token === "null" ||
        token.toLowerCase() === "bearer"
      ) {
        return res.status(401).json({
          success: false,
          message: "Not authorized, no valid token provided in Authorization header",
        });
      }

      // Step 4: JWT token format check (3 dot-separated parts: header.payload.signature)
      const tokenParts = token.split(".");
      if (tokenParts.length !== 3) {
        return res.status(401).json({
          success: false,
          message: `The provided token is malformed (${tokenParts.length} parts found instead of 3). Please make sure you copied the entire token from the login response.`,
          receivedSnippet: token.length > 30 ? token.substring(0, 30) + "..." : token,
        });
      }

      // Step 5: Secret key se token ko decrypt/verify karo
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Step 6: Token me se User ID nikaal kar database se user dhoondo
      const userId = decoded.id || decoded._id;
      req.user = await User.findById(userId).select("-password");

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Not authorized, user for this token no longer exists",
        });
      }

      // Step 7: User mil gaya, ab aage badho
      return next();
    } catch (error) {
      console.error("Token verification failed:", error.message);
      let message = "Not authorized, token failed or expired";
      if (error.name === "TokenExpiredError") {
        message = "Token has expired, please log in again";
      } else if (error.name === "JsonWebTokenError") {
        message = `Invalid token (${error.message}). Please log in again to get a fresh token.`;
      }
      return res.status(401).json({
        success: false,
        message,
      });
    }
  }

  // Step 8: Agar header me token tha hi nahi
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token provided",
    });
  }
};

module.exports = { protect };
