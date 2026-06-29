const prisma = require("../../config/db");

const createFilterGroup = async ({ name, subcategoryId }) => {
  return prisma.filterGroup.create({
    data: { name, subcategoryId },
  });
};

const createFilterValue = async ({ value, filterGroupId }) => {
  return prisma.filterValue.create({
    data: { value, filterGroupId },
  });
};

const getFiltersBySubcategory = async (subcategoryId) => {
  return prisma.filterGroup.findMany({
    where: { subcategoryId },
    include: { filterValues: true },
    orderBy: { name: "asc" },
  });
};

module.exports = {
  createFilterGroup,
  createFilterValue,
  getFiltersBySubcategory,
};
