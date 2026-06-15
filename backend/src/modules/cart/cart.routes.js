const express = require("express");

const router = express.Router();

const auth = require("../../middleware/auth.middleware");

const {
  add,

  getMyCart,

  update,

  remove,
} = require("./cart.controller");

router.get("/", auth, getMyCart);

router.post("/add", auth, add);

router.put("/update/:itemId", auth, update);

router.delete("/remove/:itemId", auth, remove);

module.exports = router;
