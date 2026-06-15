const express = require("express");
const router = express.Router();

const { createReview, getReviews } = require("./review.controller");

const authMiddleware = require("../../middleware/auth.middleware");

// add review (login required)
router.post("/", authMiddleware, createReview);

// get reviews (public)
router.get("/:productId", getReviews);

module.exports = router;
