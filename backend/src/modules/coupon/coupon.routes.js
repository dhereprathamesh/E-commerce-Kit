const express = require("express");

const router = express.Router();

const auth = require("../../middleware/auth.middleware");

const admin = require("../../middleware/admin.middleware");

const {
  create,

  validate,
} = require("./coupon.controller");

router.post("/", auth, admin, create);

router.post("/validate", auth, validate);

module.exports = router;
