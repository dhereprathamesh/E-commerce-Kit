const express = require("express");
const router = express.Router();

const {
  createOrder,
  verifyPayment,
  handleWebhook,
} = require("./payment.controller");

// normal JSON routes
router.post("/create-order", createOrder);
router.post("/verify", verifyPayment);

// ✅ IMPORTANT: RAW body ONLY for webhook
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook,
);

module.exports = router;
