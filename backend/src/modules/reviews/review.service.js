const prisma = require("../../config/db");

// Add or update review
const addReview = async (userId, productId, rating, comment) => {
  return await prisma.review.upsert({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
    update: {
      rating,
      comment,
    },
    create: {
      userId,
      productId,
      rating,
      comment,
    },
  });
};

// Get product reviews
const getProductReviews = async (productId) => {
  return await prisma.review.findMany({
    where: { productId },
    include: {
      user: {
        select: { id: true, name: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// Get average rating
const getAverageRating = async (productId) => {
  const result = await prisma.review.aggregate({
    where: { productId },
    _avg: {
      rating: true,
    },
  });

  return result._avg.rating || 0;
};

module.exports = {
  addReview,
  getProductReviews,
  getAverageRating,
};
