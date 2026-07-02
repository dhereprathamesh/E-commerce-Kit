const prisma = require("../../config/db");
const {
  createOrder,

  getMyOrders,

  getOrderById,
  updateOrderStatus,
} = require("./order.service");

const { sendEmail } = require("../notifications/email.service");
const { orderShippedTemplate } = require("../notifications/email.templates");
const notificationService = require("../notifications/notification.service");

const create = async (req, res, next) => {
  try {
    const order = await createOrder(
      req.user.id,

      req.body.addressId,

      req.body.couponCode,
    );
    await notificationService.createNotification({
      title: "New Customer Order Received ",
      message: `${customerName} has placed a new order. Total Amount: $${order.finalAmount}`,
      type: "NEW_CUSTOMER_ORDER",
      orderId: order.id,
    });

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const orders = await getMyOrders(req.user.id);

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

const getOne = async (req, res, next) => {
  try {
    const order = await getOrderById(req.params.id);

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN: update status
const changeStatus = async (req, res) => {
  try {
    const { orderId, status, message } = req.body;

    const order = await updateOrderStatus(orderId, status, message);

    // fetch user for email
    const fullOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    // EMAIL TRIGGERS
    if (status === "SHIPPED") {
      await sendEmail({
        to: fullOrder.user.email,
        subject: "Your Order Has Been Shipped 🚚",
        html: orderShippedTemplate(fullOrder),
      });
    }

    if (status === "DELIVERED") {
      await sendEmail({
        to: fullOrder.user.email,
        subject: "Order Delivered 🎉",
        html: `<p>Your order has been delivered successfully.</p>`,
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET order history
const getOrderHistory = async (req, res) => {
  try {
    const { orderId } = req.params;

    const history = await prisma.orderStatusHistory.findMany({
      where: { orderId },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      history,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  create,
  getAll,
  getOne,
  changeStatus,
  getOrderHistory,
};
