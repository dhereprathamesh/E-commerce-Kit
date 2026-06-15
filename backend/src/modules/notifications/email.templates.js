const orderConfirmationTemplate = (order) => {
  return `
    <div style="font-family: Arial; padding: 20px;">
      <h2>Order Confirmed 🎉</h2>
      <p>Hi, your order has been placed successfully.</p>

      <h3>Order ID: ${order.id}</h3>
      <p>Total: ₹${order.finalAmount}</p>

      <p>Status: ${order.status}</p>

      <br/>
      <p>We will notify you when your order is shipped.</p>
    </div>
  `;
};

const paymentSuccessTemplate = (order) => {
  return `
    <div style="font-family: Arial; padding: 20px;">
      <h2>Payment Successful 💰</h2>
      <p>Your payment has been received.</p>

      <h3>Order ID: ${order.id}</h3>
      <p>Amount Paid: ₹${order.finalAmount}</p>

      <p>Thank you for shopping with us!</p>
    </div>
  `;
};

const orderShippedTemplate = (order) => {
  return `
    <div style="font-family: Arial; padding: 20px;">
      <h2>Your Order is Shipped 🚚</h2>
      <p>Good news! Your order is on the way.</p>

      <h3>Order ID: ${order.id}</h3>
      <p>Status: ${order.status}</p>

      <p>Track your order in your dashboard.</p>
    </div>
  `;
};

module.exports = {
  orderConfirmationTemplate,
  paymentSuccessTemplate,
  orderShippedTemplate,
};
