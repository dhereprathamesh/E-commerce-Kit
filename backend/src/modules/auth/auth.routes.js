const express = require("express");

// Destructured the new refresh and logout controllers
const { register, login, refresh, logout } = require("./auth.controller");
const auth = require("../../middleware/auth.middleware");

const admin = require("../../middleware/admin.middleware");
const { create } = require("../products/product.controller");

const verificationController = require("../auth/verification.controller")
const { validate, schemas } = require('../../middleware/validate.middleware')


const router = express.Router();

router.post("/register", register);

router.post("/login", login);

// --- NEW TOKEN MANAGEMENT ENDPOINTS ---
// No access-token middleware here, as these rely on your HttpOnly refresh cookie
router.post("/refresh", refresh);
router.post("/logout", logout);

// --- UNTOUCHED ORIGINAL ROUTING INFRASTRUCTURE ---
router.post("/", auth, admin, create);

router.post('/verify-email', validate(schemas.verifyEmail), verificationController.verifyEmail)
router.post('/resend-verification', validate(schemas.resendVerification), verificationController.resendVerification)

module.exports = router;