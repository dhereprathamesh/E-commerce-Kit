const prisma = require("../../config/db");

const createAddress = async (userId, data) => {
  const addressCount = await prisma.address.count({
    where: {
      userId,
    },
  });

  return prisma.address.create({
    data: {
      ...data,

      userId,

      isDefault: addressCount === 0,
    },
  });
};

const getAddresses = async (userId) => {
  return prisma.address.findMany({
    where: {
      userId,
    },

    orderBy: {
      isDefault: "desc",
    },
  });
};

const updateAddress = async (addressId, data) => {
  return prisma.address.update({
    where: {
      id: addressId,
    },

    data,
  });
};

const deleteAddress = async (addressId) => {
  return prisma.address.delete({
    where: {
      id: addressId,
    },
  });
};

const setDefaultAddress = async (userId, addressId) => {
  await prisma.address.updateMany({
    where: {
      userId,
    },

    data: {
      isDefault: false,
    },
  });

  return prisma.address.update({
    where: {
      id: addressId,
    },

    data: {
      isDefault: true,
    },
  });
};

module.exports = {
  createAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
