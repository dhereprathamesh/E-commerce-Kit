const { z } = require("zod");

const addToCartSchema = z.object({
  productId: z.string(),

  quantity: z.number().min(1),

  variantId: z.string().optional(),
});

module.exports = {
  addToCartSchema,
};
