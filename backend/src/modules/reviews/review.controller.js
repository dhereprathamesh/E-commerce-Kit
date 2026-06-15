const prisma = require("../../config/db");
const {
  addReview,
  getProductReviews,
  getAverageRating,
} = require("./review.service");

// Add review
const createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, rating, comment } = req.body;

    // optional validation
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be 1-5" });
    }

    const review = await addReview(userId, productId, rating, comment);

    res.json({
      success: true,
      review,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get reviews
const getReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await getProductReviews(productId);
    const avgRating = await getAverageRating(productId);

    res.json({
      success: true,
      reviews,
      avgRating,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createReview,
  getReviews,
};
