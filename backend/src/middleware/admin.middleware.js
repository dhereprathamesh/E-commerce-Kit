const admin = (req, res, next) => {
  console.log(req.user);
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Admin only",
    });
  }

  next();
};

module.exports = admin;
