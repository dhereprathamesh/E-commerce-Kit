// src/modules/purchaseOrder/purchaseOrder.service.js

const prisma = require("../../config/db");

// CREATE PO (ADMIN)
const createPurchaseOrder = async (data) => {
  const { supplierId, items } = data;

  // calculate total
  let totalAmount = 0;

  items.forEach((item) => {
    totalAmount += item.quantity * item.purchasePrice;
  });

  const po = await prisma.purchaseOrder.create({
    data: {
      supplierId,
      totalAmount,
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          purchasePrice: item.purchasePrice,
        })),
      },
    },
    include: {
      items: true,
    },
  });

  return po;
};

// GET ALL POs (ADMIN)
const getAllPOs = async () => {
  return prisma.purchaseOrder.findMany({
    include: {
      supplier: true,
      items: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

// GET SINGLE PO
const getPOById = async (id) => {
  return prisma.purchaseOrder.findUnique({
    where: { id },
    include: {
      supplier: true,
      items: {
        include: { product: true },
      },
    },
  });
};

// SUPPLIER ACTION (approve/reject/ship)
const updatePOStatus = async (id, status) => {
  return prisma.purchaseOrder.update({
    where: { id },
    data: { status },
  });
};

// RECEIVE GOODS (ADMIN → STOCK UPDATE)
const receivePO = async (id) => {
  const po = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!po) throw new Error("PO not found");

  // update stock
  for (const item of po.items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: {
        stock: {
          increment: item.quantity,
        },
      },
    });
  }

  return prisma.purchaseOrder.update({
    where: { id },
    data: { status: "RECEIVED" },
  });
};

module.exports = {
  createPurchaseOrder,
  getAllPOs,
  getPOById,
  updatePOStatus,
  receivePO,
};
