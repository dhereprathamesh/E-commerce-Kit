// const crypto = require("crypto");
// const prisma = require("../../config/db");
// const { createRazorpayOrder } = require("./payment.service");

// // STEP 1: Create payment order
// const createOrder = async (req, res) => {
//   try {
//     const { orderId } = req.body;

//     const order = await prisma.order.findUnique({
//       where: { id: orderId },
//     });

//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     const razorpayOrder = await createRazorpayOrder(order.finalAmount);

//     res.json({
//       success: true,
//       razorpayOrder,
//       orderId: order.id,
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// const verifyPayment = async (req, res) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       orderId,
//     } = req.body;

//     const body = razorpay_order_id + "|" + razorpay_payment_id;

//     const expectedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(body.toString())
//       .digest("hex");

//     if (expectedSignature !== razorpay_signature) {
//       return res.status(400).json({ message: "Invalid signature" });
//     }

//     // Update order status
//     await prisma.order.update({
//       where: { id: orderId },
//       data: {
//         paymentStatus: "PAID",
//         status: "CONFIRMED",
//         paymentId: razorpay_payment_id,
//       },
//     });

//     res.json({ success: true, message: "Payment verified" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };
// const handleWebhook = async (req, res) => {
//   try {
//     const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

//     const crypto = require("crypto");

//     const shasum = crypto.createHmac("sha256", secret);
//     shasum.update(req.rawBody);
//     const digest = shasum.digest("hex");

//     if (digest !== req.headers["x-razorpay-signature"]) {
//       return res.status(400).json({ message: "Invalid webhook signature" });
//     }

//     const event = req.body;

//     // Payment successful event
//     if (event.event === "payment.captured") {
//       const payment = event.payload.payment.entity;

//       // Update order based on payment ID
//       await prisma.order.updateMany({
//         where: {
//           paymentId: payment.id,
//         },
//         data: {
//           paymentStatus: "PAID",
//           status: "CONFIRMED",
//         },
//       });
//     }

//     res.json({ success: true });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "Webhook error" });
//   }
// };

// module.exports = {
//   createOrder,
//   verifyPayment,
//   handleWebhook,
// };

const crypto = require("crypto");
const prisma = require("../../config/db");
const { createRazorpayOrder } = require("./payment.service");

//
// ================================
// 1. CREATE ORDER
// ================================
//
const createOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder(order.finalAmount);

    // IMPORTANT: save razorpay order id in DB
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentId: razorpayOrder.id, // ⚠️ store razorpay order id
      },
    });

    res.json({
      success: true,
      razorpayOrder,
      orderId: order.id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//
// ================================
// 2. VERIFY PAYMENT (FRONTEND)
// ================================
//
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    // Step 1: verify signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    // Step 2: find order using razorpay_order_id (IMPORTANT FIX)
    const order = await prisma.order.findFirst({
      where: { paymentId: razorpay_order_id },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Step 3: update order
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PAID",
        status: "CONFIRMED",
        paymentId: razorpay_order_id, // overwrite with payment id
      },
    });

    res.json({ success: true, message: "Payment verified" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//
// ================================
// 3. WEBHOOK (TRUTH SOURCE)
// ================================
//
const handleWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const shasum = crypto.createHmac("sha256", secret);
    const buffer = req.body;
    shasum.update(buffer);
    const digest = shasum.digest("hex");

    if (digest !== req.headers["x-razorpay-signature"]) {
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    const event = req.body;

    // Payment successful
    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;

      // IMPORTANT FIX: match using razorpay order id
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
    console.log(err);
    res.status(500).json({ message: "Webhook error" });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  handleWebhook,
};
