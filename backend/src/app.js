require("dotenv").config();
require("../src/config/db");

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const authRoutes = require("./modules/auth/auth.routes");
const categoryRoutes = require("./modules/categories/category.routes");
const productRoutes = require("./modules/products/product.routes");
const cartRoutes = require("./modules/cart/cart.routes");
const couponRoutes = require("./modules/coupon/coupon.routes");
const addressRoutes = require("./modules/address/address.routes");
// const orderRoutes = require("./modules/orders/order.routes");
const orderRoutes = require("./modules/order/order.routes");
const paymentRoutes = require("./modules/payments/payment.routes");
const reviewRoutes = require("./modules/reviews/review.routes");
const supplierRoutes = require("./modules/supplier/supplier.routes");

const authMiddleware = require("./middleware/auth.middleware");

const errorHandler = require("./middleware/error.middleware");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(helmet());

app.use(morgan("dev"));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// app.get("/", (req, res) => {
//   res.json({
//     success: true,
//     message: "E-Commerce API Running",
//   });
// });

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/suppliers", supplierRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
