const express = require("express");

const { create, getAll } = require("./category.controller");

const router = express.Router();

router.post("/", create);

router.get("/", getAll);

module.exports = router;
