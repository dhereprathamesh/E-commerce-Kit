const express = require("express");

const { register, login } = require("./auth.controller");
const auth = require("../../middleware/auth.middleware");

const admin = require("../../middleware/admin.middleware");
const { create } = require("../products/product.controller");

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post("/", auth, admin, create);

module.exports = router;
