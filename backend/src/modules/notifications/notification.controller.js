const notificationService = require("./notification.service");

exports.getNotifications = async (req, res) => {
  try {
    const data = await notificationService.getAdminNotifications();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.readNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await notificationService.markAsRead(id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.readAllNotifications = async (req, res) => {
  try {
    await notificationService.markAllAsRead();
    return res
      .status(200)
      .json({ success: true, message: "All notifications marked as read." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
