// const express = require("express");

// const { create, getAll, update, remove } = require("./category.controller");

// const router = express.Router();

// router.post("/", create);

// router.get("/", getAll);

// router.put("/:id", update);
// router.delete("/:id", remove);

// module.exports = router;
const express = require("express");
const {
  create,
  createSub,
  getSubcategories,
  getAll,
  update,
  remove,
} = require("./category.controller");
const auth = require("../../middleware/auth.middleware");
const admin = require("../../middleware/admin.middleware");

const router = express.Router();

router.get("/", getAll);
router.post("/", auth, admin, create);
router.post("/subcategory", auth, admin, createSub);
router.get("/subcategory", getSubcategories);
router.put("/:id", auth, admin, update);
router.delete("/:id", auth, admin, remove);

module.exports = router;
