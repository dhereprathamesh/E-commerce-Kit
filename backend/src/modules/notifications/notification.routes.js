const express = require("express");
const router = express.Router();
const controller = require("./notification.controller");
const authMiddleware = require("../../middleware/auth.middleware");
const adminMiddleware = require("../../middleware/admin.middleware");

// Universal admin gate protection
router.use(authMiddleware, adminMiddleware);

router.get("/", controller.getNotifications);
router.patch("/:id/read", controller.readNotification);
router.post("/read-all", controller.readAllNotifications);

module.exports = router;
