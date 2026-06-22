// src/modules/supplier/supplier.service.js
const prisma = require("../../config/db");
const crypto = require("crypto");

// CREATE Supplier + Product mappings
const createSupplier = async (name, email, productIds = []) => {
  return prisma.$transaction(async (tx) => {
    const supplier = await tx.supplier.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        password: "placeholder_hashed_password",
      },
    });

    // create junction mappings
    if (Array.isArray(productIds) && productIds.length > 0) {
      await tx.supplierToProduct.createMany({
        data: productIds.map((productId) => ({
          supplierId: supplier.id,
          productId,
        })),
        skipDuplicates: true, // protects @@unique([supplierId, productId])
      });
    }

    return tx.supplier.findUnique({
      where: { id: supplier.id },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });
  });
};

// GET ALL suppliers with products
const getAllSuppliers = async () => {
  return prisma.supplier.findMany({
    include: {
      products: {
        include: {
          product: true,
        },
      },
    },
  });
};

// GET supplier by ID
const getSupplierById = async (id) => {
  return prisma.supplier.findUnique({
    where: { id },
    include: {
      products: {
        include: {
          product: true,
        },
      },
    },
  });
};

// UPDATE supplier + refresh mappings
const updateSupplier = async (id, name, email, productIds = []) => {
  return prisma.$transaction(async (tx) => {
    await tx.supplier.update({
      where: { id },
      data: { name, email: email.toLowerCase().trim() },
    });

    // delete old mappings
    await tx.supplierToProduct.deleteMany({
      where: { supplierId: id },
    });

    // insert new mappings
    if (Array.isArray(productIds) && productIds.length > 0) {
      await tx.supplierToProduct.createMany({
        data: productIds.map((productId) => ({
          supplierId: id,
          productId,
        })),
        skipDuplicates: true,
      });
    }

    return tx.supplier.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });
  });
};

// DELETE supplier + mappings
const deleteSupplier = async (id) => {
  return prisma.$transaction(async (tx) => {
    await tx.supplierToProduct.deleteMany({
      where: { supplierId: id },
    });

    await tx.supplier.delete({
      where: { id },
    });

    return { message: "Supplier deleted successfully" };
  });
};

module.exports = {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
};
