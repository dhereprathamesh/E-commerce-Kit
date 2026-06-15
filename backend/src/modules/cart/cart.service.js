const prisma = require("../../config/db");

const addToCart = async (userId, data) => {
  let cart = await prisma.cart.findUnique({
    where: {
      userId,
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId,
      },
    });
  }

  const existingItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId: data.productId,
    },
  });

  if (existingItem) {
    return prisma.cartItem.update({
      where: {
        id: existingItem.id,
      },

      data: {
        quantity: existingItem.quantity + data.quantity,
      },
    });
  }

  return prisma.cartItem.create({
    data: {
      cartId: cart.id,

      productId: data.productId,

      quantity: data.quantity,

      variantId: data.variantId,
    },
  });
};

const getCart = async (userId) => {
  return prisma.cart.findUnique({
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
};

const updateCartItem = async (itemId, quantity) => {
  return prisma.cartItem.update({
    where: {
      id: itemId,
    },

    data: {
      quantity,
    },
  });
};

const removeCartItem = async (itemId) => {
  return prisma.cartItem.delete({
    where: {
      id: itemId,
    },
  });
};

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
};
