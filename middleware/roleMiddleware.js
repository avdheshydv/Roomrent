// @desc    Role-based authorization middleware
// @access  Restricts route to specific roles (e.g., 'owner', 'admin')
const authorize = (...roles) => {
  return (req, res, next) => {
    // req.user protect middleware se aata hai
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : "None"}' is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { authorize };
