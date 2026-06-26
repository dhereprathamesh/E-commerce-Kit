const express = require("express");

// const { create, getAll } = require("./product.controller");

const auth = require("../../middleware/auth.middleware");

const admin = require("../../middleware/admin.middleware");

const validate = require("../../middleware/validate.middleware");

const { createProductSchema } = require("./product.validation");
const upload = require("../../middleware/upload.middleware");
const {
  create,
  getAll,
  getOne,
  update,
  remove,
  uploadProductImage,
  bulkUpload,
} = require("./product.controller");

const router = express.Router();

router.get("/", getAll);

router.get("/:slug", getOne);

router.post(
  "/",
  auth,
  admin,
  validate.validateProduct(createProductSchema),
  create,
);

router.put(
  "/:id",
  auth,
  admin,
  validate.validateProduct(createProductSchema),
  update,
);

router.delete("/:id", auth, admin, remove);

router.post(
  "/upload-image",
  auth,
  admin,
  upload.single("image"),
  uploadProductImage,
);

router.post("/bulk-upload", auth, admin, upload.single("file"), bulkUpload);

module.exports = router;
