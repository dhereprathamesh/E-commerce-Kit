const prisma = require("../../config/db");
const slugify = require("slugify");
const cloudinary = require("../../config/cloudinary");

const streamifier = require("streamifier");

const createProduct = async (data) => {
  // const slug = slugify(data.name, {
  //   lower: true,
  //   strict: true,
  // });

  const slug = slugify(data.name, { lower: true });
  return prisma.product.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      price: Number(data.price),
      comparePrice: data.comparePrice ? Number(data.comparePrice) : null,
      stock: Number(data.stock),
      categoryId: data.categoryId,
    },
  });
};

const getProducts = async ({
  page = 1,
  limit = 10,
  search,
  categoryId,
  minPrice,
  maxPrice,
}) => {
  const skip = (page - 1) * limit;

  const where = {};

  if (search) {
    where.name = {
      contains: search,
      mode: "insensitive",
    };
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (minPrice || maxPrice) {
    where.price = {};

    if (minPrice) {
      where.price.gte = Number(minPrice);
    }

    if (maxPrice) {
      where.price.lte = Number(maxPrice);
    }
  }

  return prisma.product.findMany({
    where,

    skip,

    take: Number(limit),

    include: {
      category: true,
    },
  });
};

const getProductBySlug = async (slug) => {
  return prisma.product.findUnique({
    where: { slug },

    include: {
      category: true,
      variants: true,
    },
  });
};

// const updateProduct = async (id, data) => {
//   return prisma.product.update({
//     where: {
//       id,
//     },

//     data: {
//       name: data.name,
//       description: data.description,
//       price: Number(data.price),
//       comparePrice: data.comparePrice ? Number(data.comparePrice) : null,

//       stock: Number(data.stock),

//       categoryId: data.categoryId,
//     },
//   });
// };

const updateProduct = async (id, data) => {
  return prisma.product.update({
    where: {
      id,
    },
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      price: Number(data.price),
      comparePrice: data.comparePrice ? Number(data.comparePrice) : null,
      stock: Number(data.stock),
      categoryId: data.categoryId,
      images: data.images || [],
    },
  });
};

const deleteProduct = async (id) => {
  return prisma.product.delete({
    where: {
      id,
    },
  });
};

const uploadImage = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "ecommerce-products",
      },

      (error, result) => {
        if (error) reject(error);

        resolve(result);
      },
    );

    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};

module.exports = {
  createProduct,
  getProducts,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  uploadImage,
};
