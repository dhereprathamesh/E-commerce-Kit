const { z } = require("zod");

const createProductSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters"),

  description: z.string().min(10, "Description must be at least 10 characters"),

  price: z.number().positive("Price must be greater than 0"),

  comparePrice: z.number().positive().optional(),

  stock: z.number().int().min(0, "Stock cannot be negative"),

  categoryId: z.string().min(1, "Category is required"),
});

module.exports = {
  createProductSchema,
};
