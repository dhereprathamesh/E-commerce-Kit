const razorpay = require("../../config/razorpay");

const createRazorpayOrder = async (amount, currency = "INR") => {
  const options = {
    amount: amount * 100, // convert to paise
    currency,
    receipt: `receipt_${Date.now()}`,
  };

  const order = await razorpay.orders.create(options);
  return order;
};

module.exports = {
  createRazorpayOrder,
};
