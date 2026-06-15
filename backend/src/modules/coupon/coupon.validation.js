const { z } = require("zod");

const createCouponSchema = z.object({
  code: z.string().min(3),

  discountType: z.enum(["PERCENTAGE", "FIXED"]),

  discountValue: z.number(),

  minOrderValue: z.number().optional(),

  maxUses: z.number().optional(),

  expiresAt: z.string().optional(),
});

module.exports = {
  createCouponSchema,
};
