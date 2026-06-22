const prisma = require("../../config/db");
const crypto = require("crypto");
const { sendEmail } = require("../notifications/email.service");
// Import your custom sendEmail utility // <-- Double check this relative path matches your directory structure

const includeConfig = {
  supplier: true,
  items: { include: { product: true } },
};

/**
 * CREATE: Generates database entries and dispatches an automated verification email
 * using your centralized sendEmail configuration wrapper.
 */
const createPurchaseOrder = async ({ supplierId, items, notes }) => {
  // Generate a raw high-entropy secure crypto key and a matching sha256 hash
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  // Run DB writes in an isolated transaction block
  const order = await prisma.$transaction(async (tx) => {
    const supplier = await tx.supplier.findUnique({
      where: { id: supplierId },
    });
    if (!supplier) throw new Error("Target supplier record does not exist.");

    const totalAmount = items.reduce(
      (sum, i) => sum + i.quantity * i.purchasePrice,
      0,
    );

    const createdOrder = await tx.purchaseOrder.create({
      data: {
        supplierId,
        totalAmount,
        status: "PENDING",
        notes: JSON.stringify({
          hashedToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Link valid for 24 Hours
          internalNotes: notes || "",
        }),
        items: {
          create: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            purchasePrice: i.purchasePrice,
          })),
        },
      },
      include: {
        supplier: true,
      },
    });

    return createdOrder;
  });
  console.log("orderrrrr", order);

  // Safe Email Dispatch: Run asynchronously OUTSIDE the transaction block using YOUR setup
  if (order.supplier?.email) {
    const frontendUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const targetLink = `${frontendUrl}/verify-po?token=${rawToken}`;

    sendEmail({
      to: order.supplier.email,
      subject: `Action Required: Secure Review Request for Purchase Order #${order.id.slice(0, 8).toUpperCase()}`,
      html: `
        <div style="font-family: sans-serif; padding: 25px; color: #1e293b; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
          <h2 style="color: #0f172a; margin-top: 0; margin-bottom: 6px;">Purchase Order Generated</h2>
          <p style="font-size: 13px; color: #94a3b8; margin: 0 0 20px 0;">ID Ref: #${order.id.toUpperCase()}</p>
          
          <p>Hello <strong>${order.supplier.name}</strong>,</p>
          <p>An administrative purchase order detailing a gross outlay of <strong>$${order.totalAmount.toFixed(2)}</strong> has been opened for your catalog inventory variants.</p>
          <p>To verify access rights, click the link below and confirm your primary communication credentials. You will then unlock options to approve or cancel this dispatch routing order.</p>
          
          <div style="margin: 28px 0; text-align: center;">
            <a href="${targetLink}" 
               style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; font-weight: 600; text-decoration: none; border-radius: 6px; display: inline-block;">
              Verify Email & Review Details
            </a>
          </div>
          
          <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
          <p style="font-size: 11px; color: #94a3b8; line-height: 1.6; margin: 0;">
            <strong>Security Protocol Warning:</strong> This message contains a secure, single-use, timed connection credential. It will naturally expire precisely 24 hours from original generation layout stamps. Do not redistribute this email.
          </p>
        </div>
      `,
    })
      .then(() => {
        console.log(
          `[MAIL SUCCESS] Dispatched notification to ${order.supplier.email} via shared mail helper.`,
        );
      })
      .catch((err) => {
        console.error(
          "[MAIL CRITICAL ERROR] Email helper failed execution:",
          err.message,
        );
      });
  }

  return order;
};

/**
 * VALIDATE: verifies the email entry input against the hashed token saved in JSON metadata.
 */
const verifyOrderAccess = async (rawToken, supplierEmail) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  const orders = await prisma.purchaseOrder.findMany({
    where: { status: "PENDING" },
    include: includeConfig,
  });

  const matchingOrder = orders.find((o) => {
    try {
      const meta = JSON.parse(o.notes || "{}");
      return (
        meta.hashedToken === hashedToken &&
        new Date(meta.expiresAt) > new Date()
      );
    } catch {
      return false;
    }
  });

  if (!matchingOrder) throw new Error("Invalid or expired authorization link.");

  if (
    matchingOrder.supplier.email.toLowerCase().trim() !==
    supplierEmail.toLowerCase().trim()
  ) {
    throw new Error("Access Denied: Email mismatch validation.");
  }

  return matchingOrder;
};

/**
 * EXECUTE ACTION: Supplier marks the order state as APPROVED or REJECTED.
 */
const updateStatusBySupplier = async (orderId, action) => {
  const targetStatus = action === "APPROVE" ? "APPROVED" : "REJECTED";

  return prisma.purchaseOrder.update({
    where: { id: orderId },
    data: { status: targetStatus },
  });
};

/**
 * PULLS RELEVANT PRODUCT VARIANTS VIA THE JUNCTION TABLE RELATIONSHIP MAPPING
 */
const getProductsBySupplierId = async (supplierId) => {
  const mappings = await prisma.supplierToProduct.findMany({
    where: { supplierId },
    include: { product: true },
  });

  return mappings.filter((m) => m.product !== null).map((m) => m.product);
};

// GET ALL
const getAllPurchaseOrders = async () => {
  return prisma.purchaseOrder.findMany({ include: includeConfig });
};

// GET BY ID
const getPurchaseOrderById = async (id) => {
  return prisma.purchaseOrder.findUnique({
    where: { id },
    include: includeConfig,
  });
};

// UPDATE
const updatePurchaseOrder = async (id, { status, notes }) => {
  return prisma.purchaseOrder.update({
    where: { id },
    data: { status, notes },
    include: includeConfig,
  });
};

// DELETE
const deletePurchaseOrder = async (id) => {
  await prisma.purchaseOrderItem.deleteMany({ where: { purchaseOrderId: id } });
  await prisma.purchaseOrder.delete({ where: { id } });
  return { message: "Purchase Order deleted successfully" };
};

module.exports = {
  createPurchaseOrder,
  getAllPurchaseOrders,
  getPurchaseOrderById,
  updatePurchaseOrder,
  deletePurchaseOrder,
  verifyOrderAccess,
  updateStatusBySupplier,
  getProductsBySupplierId,
};
