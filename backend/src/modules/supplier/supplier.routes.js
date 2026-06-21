const express = require("express");
const router = express.Router();
const controller = require("./supplier.controller");

// Create a new supplier with product mappings
router.post("/", controller.create);

// Get all suppliers (with their mapped products)
router.get("/", controller.getAll);

// Get a single supplier by ID
router.get("/:id", controller.getById);

// Update a supplier and refresh their product mappings
router.put("/:id", controller.update);

// Delete a supplier and clear their mappings
router.delete("/:id", controller.delete);

module.exports = router;
