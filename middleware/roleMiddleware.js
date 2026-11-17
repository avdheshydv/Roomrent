// @desc    Role-based authorization middleware
// @access  Restricts route to specific roles (e.g., 'owner', 'admin')
const authorize = (...roles) => {
  const normalizedRoles = roles.map((r) => r.toLowerCase().trim());

  return (req, res, next) => {
    const userRole = req.user && req.user.role ? req.user.role.toLowerCase().trim() : "";

    console.log(
      `🛡️  [RBAC Check] User: ${req.user ? req.user.email : "Unknown"} | Current Role: '${userRole}' | Allowed Roles: [${normalizedRoles.join(", ")}]`
    );

    // Agar user logged in nahi hai ya uska role allowed roles me nahi hai
    if (!req.user || !normalizedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Only [${roles.join(", ")}] can access this route. Your current role is '${req.user ? req.user.role : "None"}'.`,
      });
    }

    next();
  };
};

module.exports = { authorize };
