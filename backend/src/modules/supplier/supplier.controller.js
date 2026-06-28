// src/modules/supplier/supplier.controller.js
const service = require("./supplier.service");

// CREATE
const create = async (req, res) => {
  try {
    const { name, email, product_ids } = req.body;

    if (!name || !email) {
      return res
        .status(400)
        .json({ message: "Name and email are required fields." });
    }

    const supplier = await service.createSupplier(name, email, product_ids);

    res.status(201).json(supplier);
  } catch (error) {
    console.error("CREATE SUPPLIER ERROR:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET ALL
// const getAll = async (req, res) => {
//   try {
//     const suppliers = await service.getAllSuppliers();
//     res.status(200).json(suppliers);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: error.message });
//   }
// };

const getAll = async (req, res) => {
  try {
    // Extract query parameters with standard fallbacks
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || ""; // Capture search query string

    // Pass the search query straight to the service layer
    const { suppliers, pagination } = await service.getAllSuppliers(
      page,
      limit,
      search,
    );

    // Return filtered data along with matching metadata matrix
    res.status(200).json({
      data: suppliers,
      pagination,
    });
  } catch (error) {
    console.error("Error fetching paginated/filtered suppliers:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to load suppliers." });
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
    const { name, email, product_ids } = req.body;

    const updated = await service.updateSupplier(
      req.params.id,
      name,
      email,
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
