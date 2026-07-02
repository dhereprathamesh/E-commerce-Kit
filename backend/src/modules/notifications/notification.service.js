const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class NotificationService {
  /**
   * Core generator for app notifications
   */
  async createNotification({
    title,
    message,
    type,
    orderId = null,
    purchaseOrderId = null,
  }) {
    return await prisma.notification.create({
      data: {
        title,
        message,
        type,
        orderId,
        purchaseOrderId,
      },
    });
  }

  /**
   * Fetch all notifications for the Admin panel (Newest first)
   */
  async getAdminNotifications() {
    return await prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        order: true, // Optional: pulls customer order data if attached
        purchaseOrder: true, // Optional: pulls procurement data if attached
      },
    });
  }

  /**
   * Mark an isolated notification alert as read
   */
  async markAsRead(id) {
    return await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  /**
   * Clear-all utility for clearing out the notification panel status
   */
  async markAllAsRead() {
    return await prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });
  }
}

module.exports = new NotificationService();
