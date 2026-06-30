const {
  createCategory,
  createSubcategory,
  getSubcategoriesByCategoryId,
  getAllCategories,
  updateCategory,
  deleteCategory,
} = require("./category.service");

const create = async (req, res, next) => {
  try {
    const category = await createCategory(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

const createSub = async (req, res, next) => {
  try {
    const subcategory = await createSubcategory(req.body);
    res.status(201).json({ success: true, data: subcategory });
  } catch (error) {
    next(error);
  }
};

const getSubcategories = async (req, res, next) => {
  try {
    const { categoryId } = req.query;
    console.log(categoryId);

    const subcategories = await getSubcategoriesByCategoryId(categoryId);

    res.json({
      success: true,
      data: subcategories,
    });
  } catch (error) {
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const categories = await getAllCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const category = await updateCategory(req.params.id, req.body);
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await deleteCategory(req.params.id);
    res.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  createSub,
  getSubcategories,
  getAll,
  update,
  remove,
};
