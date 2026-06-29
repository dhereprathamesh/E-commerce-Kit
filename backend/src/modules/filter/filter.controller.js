const {
  createFilterGroup,
  createFilterValue,
  getFiltersBySubcategory,
} = require("./filter.service");

const createGroup = async (req, res, next) => {
  try {
    const group = await createFilterGroup(req.body);
    res.status(201).json({ success: true, data: group });
  } catch (error) {
    next(error);
  }
};

const createValue = async (req, res, next) => {
  try {
    const val = await createFilterValue(req.body);
    res.status(201).json({ success: true, data: val });
  } catch (error) {
    next(error);
  }
};

const getSubcategoryFilters = async (req, res, next) => {
  try {
    const filters = await getFiltersBySubcategory(req.params.subcategoryId);
    res.json({ success: true, data: filters });
  } catch (error) {
    next(error);
  }
};

module.exports = { createGroup, createValue, getSubcategoryFilters };
