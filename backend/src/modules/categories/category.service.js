const prisma = require("../../config/db");
const slugify = require("slugify");
const buildTree = require("../../utils/categoryTree");

const createCategory = async ({ name, parentId }) => {
  const slug = slugify(name, {
    lower: true,
    strict: true,
  });

  const existingCategory = await prisma.category.findUnique({
    where: { slug }, // Assumes 'slug' or 'name' is unique in your Prisma schema
  });

  if (existingCategory) {
    throw new Error("Category already exists");
  }
  return prisma.category.create({
    data: {
      name,
      slug,
      parentId: parentId || null,
    },
  });
};

const getAllCategories = async () => {
  const categories = await prisma.category.findMany();

  return buildTree(categories);
};

const updateCategory = async (id, { name }) => {
  const slug = slugify(name, {
    lower: true,
    strict: true,
  });
  // Check if another category is already using this new slug
  const existingCategory = await prisma.category.findFirst({
    where: {
      slug,
      NOT: { id }, // Exclude the current category we are updating
    },
  });

  if (existingCategory) {
    throw new Error("Category already exists");
  }

  return prisma.category.update({
    where: { id },
    data: {
      name,
      slug,
    },
  });
};

const deleteCategory = async (id) => {
  return prisma.category.delete({
    where: { id },
  });
};

module.exports = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
};
