const prisma = require("../../config/db");

const { validateCoupon, markCouponUsed } = require("../coupon/coupon.service");

const createOrder = async (userId, addressId, couponCode) => {
  const cart = await prisma.cart.findUnique({
    where: {
      userId,
    },

    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  const address = await prisma.address.findUnique({
    where: {
      id: addressId,
    },
  });

  if (!address) {
    throw new Error("Address not found");
  }

  let totalAmount = 0;

  for (const item of cart.items) {
    if (item.product.stock < item.quantity) {
      throw new Error(`${item.product.name} out of stock`);
    }

    totalAmount += item.product.price * item.quantity;
  }

  let discountAmount = 0;

  if (couponCode) {
    const couponResult = await validateCoupon(couponCode, totalAmount);

    discountAmount = couponResult.discount;
  }

  const finalAmount = totalAmount - discountAmount;

  const order = await prisma.order.create({
    data: {
      userId,

      totalAmount,

      discountAmount,

      finalAmount,

      couponCode,

      address: {
        fullName: address.fullName,

        phone: address.phone,

        line1: address.line1,

        line2: address.line2,

        city: address.city,

        state: address.state,

        pincode: address.pincode,
      },
    },
  });

  for (const item of cart.items) {
    await prisma.orderItem.create({
      data: {
        orderId: order.id,

        productId: item.productId,

        quantity: item.quantity,

        price: item.product.price,
      },
    });

    await prisma.product.update({
      where: {
        id: item.productId,
      },

      data: {
        stock: {
          decrement: item.quantity,
        },
      },
    });
  }

  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: {
        code: couponCode.toUpperCase(),
      },
    });

    await markCouponUsed(coupon.id);
  }

  await prisma.cartItem.deleteMany({
    where: {
      cartId: cart.id,
    },
  });

  return order;
};

const getMyOrders = async (userId) => {
  return prisma.order.findMany({
    where: {
      userId,
    },

    include: {
      items: {
        include: {
          product: true,
        },
      },
    },

    orderBy: {
      createdAt: "asc",
    },
  });
};

const getOrderById = async (orderId) => {
  return prisma.order.findUnique({
    where: {
      id: orderId,
    },

    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });
};

// Validate status transition
const isValidTransition = (current, next) => {
  const flow = {
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["PROCESSING", "CANCELLED"],
    PROCESSING: ["SHIPPED"],
    SHIPPED: ["DELIVERED"],
    DELIVERED: [],
    CANCELLED: [],
  };

  return flow[current]?.includes(next);
};

// Update order status
const updateOrderStatus = async (orderId, newStatus, message) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) throw new Error("Order not found");

  // validate transition
  if (!isValidTransition(order.status, newStatus)) {
    throw new Error(
      `Invalid status transition: ${order.status} → ${newStatus}`,
    );
  }

  // update order
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: newStatus,
    },
  });

  // save history
  await prisma.orderStatusHistory.create({
    data: {
      orderId,
      status: newStatus,
      message,
    },
  });

  return updatedOrder;
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
};
