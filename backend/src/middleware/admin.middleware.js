const adminAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized - no user",
    });
  }

  if (req.user.userType !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Admin only",
    });
  }

  next();
};

module.exports = adminAuth;
