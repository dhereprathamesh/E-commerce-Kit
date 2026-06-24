const service = require("./purchaseOrder.service");
const jwt = require("jsonwebtoken");

// CREATE (Admin triggers PO creation and secure automated email)
const create = async (req, res) => {
  try {
    const { supplierId, items, notes } = req.body;

    if (!supplierId || !items || !items.length) {
      return res
        .status(400)
        .json({ message: "Supplier ID and items are required." });
    }

    const order = await service.createPurchaseOrder({
      supplierId,
      items,
      notes,
    });
    res.status(201).json(order);
  } catch (error) {
    console.error("CREATE PURCHASE ORDER ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET ALL
// const getAll = async (req, res) => {
//   try {
//     const orders = await service.getAllPurchaseOrders();
//     res.status(200).json(orders);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: error.message });
//   }
// };
// GET ALL (Updated to accept view and status filter parameters)
const getAll = async (req, res) => {
  try {
    const { view, status } = req.query;

    const orders = await service.getAllPurchaseOrders({ view, status });

    res.status(200).json(orders);
  } catch (error) {
    console.error("GET ALL PURCHASE ORDERS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET BY ID
const getById = async (req, res) => {
  try {
    const order = await service.getPurchaseOrderById(req.params.id);
    if (!order)
      return res.status(404).json({ message: "Purchase order not found" });
    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// UPDATE (Admin adjustments)
const update = async (req, res) => {
  try {
    const updated = await service.updatePurchaseOrder(req.params.id, req.body);
    res.status(200).json(updated);
  } catch (error) {
    console.error("UPDATE PURCHASE ORDER ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// DELETE
const remove = async (req, res) => {
  try {
    const result = await service.deletePurchaseOrder(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// STEP 1: Verify the URL token + User email combo input
const verifySupplierLink = async (req, res) => {
  try {
    const { token, email } = req.body; // token from query string, email from UI input form

    if (!token || !email) {
      return res
        .status(400)
        .json({ message: "Token and verification email are required." });
    }

    const order = await service.verifyOrderAccess(token, email);

    // Issue an ephemeral JWT valid for 15 minutes to secure this transaction session
    const sessionToken = jwt.sign(
      { poId: order.id },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "15m" },
    );

    res.cookie("po_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    res.status(200).json({
      message: "Identity verified successfully.",
      purchaseOrder: order,
    });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

// STEP 2: Execute action using HttpOnly authorization state
const executeSupplierAction = async (req, res) => {
  try {
    const { action } = req.body; // "APPROVE" or "REJECT"
    const sessionCookie = req.cookies.po_session;

    if (!sessionCookie) {
      return res.status(401).json({
        message: "Session expired or unauthorized interaction lifecycle.",
      });
    }

    const decoded = jwt.verify(
      sessionCookie,
      process.env.JWT_SECRET || "fallback_secret",
    );
    const updatedOrder = await service.updateStatusBySupplier(
      decoded.poId,
      action,
    );

    res.clearCookie("po_session");
    res
      .status(200)
      .json({ message: `Order marked successfully as ${updatedOrder.status}` });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET SUPPLIER CATALOG INDEX
const getSupplierProducts = async (req, res) => {
  try {
    const { supplierId } = req.params;
    if (!supplierId) {
      return res
        .status(400)
        .json({ message: "Supplier ID parameter is required." });
    }

    const products = await service.getProductsBySupplierId(supplierId);
    res.status(200).json(products);
  } catch (error) {
    console.error("GET SUPPLIER PRODUCTS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

const requestOtpLink = async (req, res) => {
  try {
    res
      .status(200)
      .json(await service.generateOtpForOrder(req.body.token, req.body.email));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const verifyOtpCode = async (req, res) => {
  try {
    const order = await service.verifyOtpAndGetOrder(
      req.body.poId,
      req.body.otpCode,
    );
    const sessionToken = jwt.sign(
      { poId: order.id },
      process.env.JWT_SECRET || "fallback",
      { expiresIn: "30m" },
    );
    res.cookie("po_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 60 * 1000,
    });
    res.status(200).json({ purchaseOrder: order });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

const saveQuotationFields = async (req, res) => {
  try {
    const { poId, items } = req.body;

    if (!poId) {
      return res.status(400).json({ message: "poId missing" });
    }

    const result = await service.submitSupplierQuotation(poId, items);

    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const approveQuotation = async (req, res) => {
  try {
    const { id } = req.params; // This will be the supplierQuotationId

    const result = await service.approveQuotationAndNotify(id);
    res.status(200).json({
      message:
        "Quotation approved and notification emails dispatched successfully.",
      data: result,
    });
  } catch (error) {
    console.error("APPROVE QUOTATION ERROR:", error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  create,
  getAll,
  getById,
  update,
  delete: remove,
  verifySupplierLink,
  executeSupplierAction,
  getSupplierProducts,
  requestOtpLink,
  verifyOtpCode,
  saveQuotationFields,
  approveQuotation,
};
