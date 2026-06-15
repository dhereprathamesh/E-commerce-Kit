const { z } = require("zod");

const createAddressSchema = z.object({
  fullName: z.string().min(3),

  phone: z.string().min(10),

  line1: z.string().min(3),

  line2: z.string().optional(),

  city: z.string(),

  state: z.string(),

  pincode: z.string(),
});

module.exports = {
  createAddressSchema,
};
