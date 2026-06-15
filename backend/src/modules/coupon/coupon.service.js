const prisma = require("../../config/db");

const createCoupon = async (data) => {
  return prisma.coupon.create({
    data: {
      code: data.code.toUpperCase(),

      discountType: data.discountType,

      discountValue: data.discountValue,

      minOrderValue: data.minOrderValue || 0,

      maxUses: data.maxUses,

      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    },
  });
};

const validateCoupon = async (code, orderAmount) => {
  const coupon = await prisma.coupon.findUnique({
    where: {
      code: code.toUpperCase(),
    },
  });

  if (!coupon) {
    throw new Error("Invalid coupon");
  }

  if (!coupon.isActive) {
    throw new Error("Coupon inactive");
  }

  if (coupon.expiresAt && new Date() > coupon.expiresAt) {
    throw new Error("Coupon expired");
  }

  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    throw new Error("Usage limit reached");
  }

  if (orderAmount < coupon.minOrderValue) {
    throw new Error(`Minimum order value is ${coupon.minOrderValue}`);
  }

  let discount = 0;

  if (coupon.discountType === "PERCENTAGE") {
    discount = (orderAmount * coupon.discountValue) / 100;
  } else {
    discount = coupon.discountValue;
  }

  return {
    coupon,
    discount,
    finalAmount: orderAmount - discount,
  };
};

const markCouponUsed = async (couponId) => {
  return prisma.coupon.update({
    where: {
      id: couponId,
    },

    data: {
      usedCount: {
        increment: 1,
      },
    },
  });
};

module.exports = {
  createCoupon,
  validateCoupon,
  markCouponUsed,
};
