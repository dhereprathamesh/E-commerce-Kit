// src/modules/supplier/supplier.service.js
const prisma = require("../../config/db");
const crypto = require("crypto");

// CREATE Supplier + Product mappings
const createSupplier = async (name, email, productIds = []) => {
  return prisma.$transaction(async (tx) => {
    // 1. Check if a supplier with this email already exists
    const existingSupplier = await tx.supplier.findUnique({
      where: {
        email: email,
      },
    });

    if (existingSupplier) {
      // Throwing aborts the transaction immediately
      throw new Error("Supplier with this email already exists");
    }

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
// const getAllSuppliers = async () => {
//   return prisma.supplier.findMany({
//     include: {
//       products: {
//         include: {
//           product: true,
//         },
//       },
//     },
//   });
// };

const getAllSuppliers = async (page = 1, limit = 10) => {
  // Calculate how many records to skip
  const skip = (page - 1) * limit;

  // Run both queries concurrently to keep performance snappy
  const [suppliers, total] = await prisma.$transaction([
    prisma.supplier.findMany({
      skip: parseInt(skip),
      take: parseInt(limit),
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        id: "asc", // Keeps ordering stable across pages
      },
    }),
    prisma.supplier.count(),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    suppliers,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages,
    },
  };
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
