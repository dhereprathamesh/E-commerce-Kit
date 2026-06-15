const express = require("express");

const auth = require("../../middleware/auth.middleware");

const {
  create,
  getAll,
  getOne,
  changeStatus,
  getOrderHistory,
} = require("./order.controller");

const authMiddleware = require("../../middleware/auth.middleware");
const adminMiddleware = require("../../middleware/admin.middleware");

const router = express.Router();

router.post("/", auth, create);

router.get("/my", auth, getAll);

router.get("/:id", auth, getOne);

// ADMIN ONLY
router.put("/status", authMiddleware, adminMiddleware, changeStatus);

// ORDER TIMELINE
router.get("/:orderId/history", authMiddleware, getOrderHistory);

module.exports = router;
