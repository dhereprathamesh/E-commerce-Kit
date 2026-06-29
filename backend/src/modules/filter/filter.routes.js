const express = require("express");
const {
  createGroup,
  createValue,
  getSubcategoryFilters,
} = require("./filter.controller");
const auth = require("../../middleware/auth.middleware");
const admin = require("../../middleware/admin.middleware");

const router = express.Router();

// Public route for the frontend layout/filtering sidebars
router.get("/subcategory/:subcategoryId", getSubcategoryFilters);

// Admin-protected setup routes
router.post("/groups", auth, admin, createGroup);
router.post("/values", auth, admin, createValue);

module.exports = router;
