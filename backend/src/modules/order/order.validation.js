const { z } = require("zod");

const createOrderSchema = z.object({
  addressId: z.string(),

  couponCode: z.string().optional(),
});

module.exports = {
  createOrderSchema,
};
