const express = require("express");

const router = express.Router();

const auth = require("../../middleware/auth.middleware");

const {
  create,

  getAll,

  update,

  remove,

  setDefault,
} = require("./address.controller");

router.post("/", auth, create);

router.get("/", auth, getAll);

router.put("/:id", auth, update);

router.delete("/:id", auth, remove);

router.put("/default/:id", auth, setDefault);

module.exports = router;
