const {
  createCoupon,

  validateCoupon,
} = require("./coupon.service");

const create = async (req, res, next) => {
  try {
    const coupon = await createCoupon(req.body);

    res.status(201).json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
};

const validate = async (req, res, next) => {
  try {
    const { code, orderAmount } = req.body;

    const result = await validateCoupon(code, orderAmount);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  validate,
};
