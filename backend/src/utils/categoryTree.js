const buildTree = (categories, parentId = null) => {
  return categories
    .filter((category) => category.parentId === parentId)
    .map((category) => ({
      ...category,
      children: buildTree(categories, category.id),
    }));
};

module.exports = buildTree;
