const prisma = require("../../config/db");
const slugify = require("slugify");
const cloudinary = require("../../config/cloudinary");
const csv = require("csv-parser");
const streamifier = require("streamifier");

const createProduct = async (data) => {
  // const slug = slugify(data.name, {
  //   lower: true,
  //   strict: true,
  // });

  const slug = slugify(data.name, { lower: true, strict: true });

  // 1. Check if a product with this slug already exists
  const existingProduct = await prisma.product.findUnique({
    where: { slug },
  });

  if (existingProduct) {
    throw new Error("Product already exists");
  }

  // const slug = slugify(data.name, { lower: true });
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

  // return prisma.product.findMany({
  //   where,

  //   skip,

  //   take: Number(limit),

  //   include: {
  //     category: true,
  //   },
  // });
  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.product.count({ where }),
  ]);
  return {
    products,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / limit),
  };
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

const updateProduct = async (id, data) => {
  const slug = data.name
    ? slugify(data.name, { lower: true, strict: true })
    : data.slug;

  // 2. Check if another product is already using this slug
  if (slug) {
    const existingProduct = await prisma.product.findFirst({
      where: {
        slug,
        NOT: { id }, // Make sure it ignores the product we are currently updating
      },
    });

    if (existingProduct) {
      throw new Error("Product already exists");
    }
  }
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

const bulkCreateProducts = async (fileBuffer) => {
  const parsedRows = await new Promise((resolve, reject) => {
    const results = [];
    streamifier
      .createReadStream(fileBuffer)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (error) => reject(error));
  });

  const summary = {
    totalProcessed: parsedRows.length,
    successCount: 0,
    skippedCount: 0,
    errors: [],
  };

  for (let i = 0; i < parsedRows.length; i++) {
    const row = parsedRows[i];
    const rowNumber = i + 1;

    try {
      // 1. Validation check for mandatory fields
      if (!row.name || !row.price || !row.categoryName) {
        throw new Error(
          "Missing mandatory fields (name, price, or categoryName)",
        );
      }

      const productSlug = slugify(row.name, { lower: true, strict: true });

      // 2. Check if product already exists to prevent duplicate items
      const existingProduct = await prisma.product.findUnique({
        where: { slug: productSlug },
      });

      if (existingProduct) {
        summary.skippedCount++;
        summary.errors.push(
          `Row ${rowNumber}: Skipped - Product "${row.name}" already exists.`,
        );
        continue;
      }

      // 3. Resolve or Create the Category using its name
      const categoryNameClean = row.categoryName.trim();
      const categorySlug = slugify(categoryNameClean, {
        lower: true,
        strict: true,
      });

      let category = await prisma.category.findUnique({
        where: { slug: categorySlug },
      });

      // If category doesn't exist, create it cleanly on the fly
      if (!category) {
        category = await prisma.category.create({
          data: {
            name: categoryNameClean,
            slug: categorySlug,
            parentId: null, // Defaulting root level for bulk uploads
          },
        });
      }

      // 4. Safe to insert the product mapped to the target category ID
      await prisma.product.create({
        data: {
          name: row.name,
          slug: productSlug,
          description: row.description || "",
          price: Number(row.price),
          comparePrice: row.comparePrice ? Number(row.comparePrice) : null,
          stock: row.stock ? Number(row.stock) : 0,
          categoryId: category.id, // Linked securely here
        },
      });

      summary.successCount++;
    } catch (err) {
      summary.skippedCount++;
      summary.errors.push(
        `Row ${rowNumber}: Failed due to error - ${err.message}`,
      );
    }
  }

  return summary;
};

module.exports = {
  createProduct,
  getProducts,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  uploadImage,
  bulkCreateProducts,
};
