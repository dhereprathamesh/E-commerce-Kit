const prisma = require("../../config/db");
const slugify = require("slugify");

const createCategory = async ({ name }) => {
  const slug = slugify(name, { lower: true, strict: true });

  const existingCategory = await prisma.category.findUnique({
    where: { slug },
  });
  if (existingCategory) throw new Error("Category already exists");

  return prisma.category.create({
    data: { name, slug },
  });
};

const createSubcategory = async ({ name, categoryId }) => {
  const slug = slugify(name, { lower: true, strict: true });

  const existingSub = await prisma.subcategory.findUnique({ where: { slug } });
  if (existingSub) throw new Error("Subcategory already exists");

  return prisma.subcategory.create({
    data: { name, slug, categoryId },
  });
};
const getSubcategoriesByCategoryId = async (categoryId) => {
  console.log("service", categoryId);

  const whereClause = categoryId ? { categoryId } : {};

  return prisma.subcategory.findMany({
    where: whereClause,
    orderBy: { name: "asc" },
  });
};

const getAllCategories = async () => {
  // Returns all master categories with their child subcategories nested inside
  return prisma.category.findMany({
    include: { subcategories: true },
    orderBy: { name: "asc" },
  });
};

const updateCategory = async (id, { name }) => {
  const slug = slugify(name, { lower: true, strict: true });

  const existingCategory = await prisma.category.findFirst({
    where: { slug, NOT: { id } },
  });
  if (existingCategory) throw new Error("Category name slug already in use");

  return prisma.category.update({
    where: { id },
    data: { name, slug },
  });
};

const deleteCategory = async (id) => {
  return prisma.category.delete({ where: { id } });
};

module.exports = {
  createCategory,
  createSubcategory,
  getSubcategoriesByCategoryId,
  getAllCategories,
  updateCategory,
  deleteCategory,
};
