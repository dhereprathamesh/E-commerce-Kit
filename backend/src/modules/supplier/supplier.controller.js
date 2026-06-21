// src/modules/supplier/supplier.controller.js
const service = require("./supplier.service");

// CREATE
const create = async (req, res) => {
  try {
    const { name, product_ids } = req.body;

    const supplier = await service.createSupplier(name, product_ids);

    res.status(201).json(supplier);
  } catch (error) {
    console.error("CREATE SUPPLIER ERROR:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET ALL
const getAll = async (req, res) => {
  try {
    const suppliers = await service.getAllSuppliers();
    res.status(200).json(suppliers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// GET BY ID
const getById = async (req, res) => {
  try {
    const supplier = await service.getSupplierById(req.params.id);

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.status(200).json(supplier);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// UPDATE
const update = async (req, res) => {
  try {
    const { name, product_ids } = req.body;

    const updated = await service.updateSupplier(
      req.params.id,
      name,
      product_ids,
    );

    res.status(200).json(updated);
  } catch (error) {
    console.error("UPDATE SUPPLIER ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// DELETE
const remove = async (req, res) => {
  try {
    const result = await service.deleteSupplier(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    console.error("DELETE SUPPLIER ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  create,
  getAll,
  getById,
  update,
  delete: remove,
};
