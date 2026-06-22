const express = require("express");

const { register, login } = require("./auth.controller");
const auth = require("../../middleware/auth.middleware");

const admin = require("../../middleware/admin.middleware");
const { create } = require("../products/product.controller");

const verificationController = require("../auth/verification.controller")
const { validate, schemas } = require('../../middleware/validate.middleware')


const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post("/", auth, admin, create);

router.post('/verify-email', validate(schemas.verifyEmail), verificationController.verifyEmail)
router.post('/resend-verification', validate(schemas.resendVerification), verificationController.resendVerification)

module.exports = router;
