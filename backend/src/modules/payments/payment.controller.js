const crypto = require("crypto");
const prisma = require("../../config/db");
const { createRazorpayOrder } = require("./payment.service");

// ================================
// 1. CREATE RAZORPAY ORDER REFERENCE
// ================================
const createOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res
        .status(400)
        .json({ message: "Missing required field: orderId" });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Create Razorpay order reference
    const razorpayOrder = await createRazorpayOrder(order.finalAmount);

    // Save the razorpay order ID to the order entry as a payment tracing ID
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentId: razorpayOrder.id,
      },
    });

    res.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      keyId: process.env.RAZORPAY_KEY_ID, // Send this down to avoid hardcoding on front-end
      orderId: order.id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================================
// 2. VERIFY PAYMENT (FRONTEND HANDLER)
// ================================
const verifyPayment = async (req, res) => {
  try {
    // Standardize mapping to support both snake_case and camelCase payloads safely
    const razorpay_order_id =
      req.body.razorpay_order_id || req.body.razorpayOrderId;
    const razorpay_payment_id =
      req.body.razorpay_payment_id || req.body.razorpayPaymentId;
    const razorpay_signature =
      req.body.razorpay_signature || req.body.razorpaySignature;
    const orderId = req.body.orderId;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res
        .status(400)
        .json({ message: "Missing required payment verification tokens." });
    }

    // Step 1: Crypto signature token calculation checks
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ message: "Invalid signature confirmation" });
    }

    // Step 2: Fetch target record using the parent system tracking reference
    let order = null;
    if (orderId) {
      order = await prisma.order.findUnique({ where: { id: orderId } });
    } else {
      order = await prisma.order.findFirst({
        where: { paymentId: razorpay_order_id },
      });
    }

    if (!order) {
      return res
        .status(404)
        .json({ message: "Associated local database order record not found." });
    }

    // Step 3: Mutate record variables to reflect payment validation state
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PAID",
        status: "CONFIRMED",
        paymentId: razorpay_payment_id, // Save actual transactional payment tracking reference id
      },
    });

    res.json({ success: true, message: "Payment verified successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================================
// 3. WEBHOOK (BACKEND TRUTH ENGINE)
// ================================
const handleWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(req.body);
    const digest = shasum.digest("hex");

    if (digest !== req.headers["x-razorpay-signature"]) {
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    const event = JSON.parse(req.body.toString());

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;

      await prisma.order.updateMany({
        where: {
          paymentId: payment.order_id,
        },
        data: {
          paymentStatus: "PAID",
          status: "CONFIRMED",
        },
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Webhook conversion execution failed" });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  handleWebhook,
};
