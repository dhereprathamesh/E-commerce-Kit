const prisma = require("../../config/db");
const slugify = require("slugify");
const buildTree = require("../../utils/categoryTree");

const createCategory = async ({ name, parentId }) => {
  const slug = slugify(name, {
    lower: true,
    strict: true,
  });

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

module.exports = {
  createCategory,
  getAllCategories,
};
