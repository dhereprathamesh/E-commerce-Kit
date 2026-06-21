// src/modules/supplier/supplier.middleware.js

const jwt = require("jsonwebtoken");

const supplierAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "SUPPLIER") {
      return res.status(403).json({ message: "Access denied" });
    }

    req.supplier = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = supplierAuth;
