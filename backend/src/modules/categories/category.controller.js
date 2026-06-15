const { createCategory, getAllCategories } = require("./category.service");

const create = async (req, res, next) => {
  try {
    const category = await createCategory(req.body);

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const categories = await getAllCategories();

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  getAll,
};
