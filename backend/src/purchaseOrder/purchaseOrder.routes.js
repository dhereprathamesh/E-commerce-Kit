// src/modules/purchaseOrder/purchaseOrder.routes.js

const express = require("express");
const router = express.Router();

const controller = require("./purchaseOrder.controller");

const adminAuth = require("../auth/adminAuth");
const supplierAuth = require("../supplier/supplier.middleware");

// ADMIN
router.post("/", adminAuth, controller.createPO);
router.get("/", adminAuth, controller.getPOs);
router.get("/:id", adminAuth, controller.getPO);

// SUPPLIER ACTIONS
router.patch("/:id/status", supplierAuth, controller.updateStatus);

// ADMIN RECEIVE GOODS
router.patch("/:id/receive", adminAuth, controller.receivePO);

module.exports = router;
