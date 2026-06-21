// src/modules/purchaseOrder/purchaseOrder.controller.js

const service = require("./purchaseOrder.service");

// ADMIN: create PO
const createPO = async (req, res) => {
  try {
    const po = await service.createPurchaseOrder(req.body);
    res.status(201).json(po);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADMIN: get all
const getPOs = async (req, res) => {
  try {
    const data = await service.getAllPOs();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADMIN: get one
const getPO = async (req, res) => {
  try {
    const data = await service.getPOById(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// SUPPLIER ACTION
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const po = await service.updatePOStatus(req.params.id, status);

    res.json(po);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADMIN RECEIVE GOODS
const receivePO = async (req, res) => {
  try {
    const po = await service.receivePO(req.params.id);
    res.json(po);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createPO,
  getPOs,
  getPO,
  updateStatus,
  receivePO,
};
