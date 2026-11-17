const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  // Step 1: Check token in query param (?token=...), x-auth-token header, request body, or Authorization header
  const authHeader = req.headers.authorization;

  if (req.query && req.query.token) {
    token = String(req.query.token).trim().replace(/^[<{"']+|[>}"']+$/g, "");
  } else if (req.headers["x-auth-token"]) {
    token = String(req.headers["x-auth-token"]).trim().replace(/^[<{"']+|[>}"']+$/g, "");
  } else if (req.body && req.body.token) {
    token = String(req.body.token).trim().replace(/^[<{"']+|[>}"']+$/g, "");
  } else if (authHeader && authHeader.trim().toLowerCase().startsWith("bearer")) {
    let cleanHeader = authHeader.trim().replace(/^["']|["']$/g, "").trim();
    // Handle duplicate "Bearer" prefixes (e.g. Postman Auth tab adding "Bearer" on top of "Bearer ...")
    token = cleanHeader.replace(/^(Bearer\s*)+/i, "").trim();
    token = token.replace(/^[<{"']+|[>}"']+$/g, "").trim();
  }

  // Check if token exists and is not a placeholder
  if (
    !token ||
    token === "undefined" ||
    token === "null" ||
    token.toLowerCase() === "bearer"
  ) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token provided",
    });
  }

  try {
    // Step 2: JWT token format check (3 dot-separated parts: header.payload.signature)
    const tokenParts = token.split(".");
    if (tokenParts.length !== 3) {
      return res.status(401).json({
        success: false,
        message: `The provided token is malformed (${tokenParts.length} parts found instead of 3). Please make sure you copied the entire token from the login response.`,
        receivedSnippet: token.length > 30 ? token.substring(0, 30) + "..." : token,
      });
    }

    // Step 3: Secret key se token verify karo
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (verifyError) {
      // Development mode fallback: If token signature is authentic but expired,
      // allow testing in development mode so you're not blocked during local dev
      if (
        verifyError.name === "TokenExpiredError" &&
        process.env.NODE_ENV === "development"
      ) {
        decoded = jwt.decode(token);
        console.warn(
          `⚠️  [AUTH DEV MODE] Token was expired (${verifyError.expiredAt}), but bypassed for local development.`
        );
      } else {
        throw verifyError;
      }
    }

    req.token = token;
    req.tokenDecoded = decoded;

    // Step 4: Token me se User ID nikaal kar database se user dhoondo
    const userId = decoded.id || decoded._id;
    req.user = await User.findById(userId).select("-password");

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, user for this token no longer exists in database. Please register/login to create an active user.",
      });
    }

    console.log(
      `🔑 [AUTH SUCCESS] ${req.method} ${req.originalUrl} | User: ${req.user.name} (${req.user.email}) | Role: '${req.user.role}'`
    );

    // Step 5: User mil gaya, ab aage badho
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
};

module.exports = { protect };
