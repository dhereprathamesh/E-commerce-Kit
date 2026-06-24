// src/modules/purchaseOrder/purchaseOrder.routes.js
const express = require("express");
const router = express.Router();
const controller = require("./purchaseOrder.controller");

// Admin operations
router.post("/", controller.create);
router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);
router.get("/products/:supplierId", controller.getSupplierProducts);
// Secure supplier interaction workflow loops
router.post("/request-otp", controller.requestOtpLink);
router.post("/verify-otp", controller.verifyOtpCode);
router.post("/submit-quotation", controller.saveQuotationFields);

router.post("/quotations/:id/approve", controller.approveQuotation);

module.exports = router;
