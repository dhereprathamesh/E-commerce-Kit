const {
  addToCart,

  getCart,

  updateCartItem,

  removeCartItem,
} = require("./cart.service");

const add = async (req, res, next) => {
  try {
    const item = await addToCart(req.user.id, req.body);

    res.status(201).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

const getMyCart = async (req, res, next) => {
  try {
    const cart = await getCart(req.user.id);

    res.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const item = await updateCartItem(req.params.itemId, req.body.quantity);

    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await removeCartItem(req.params.itemId);

    res.json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  add,
  getMyCart,
  update,
  remove,
};
