const express = require("express");
const router = express.Router();
const stripeController = require("../controller/stripeController");
router.route("/").post(stripeController);

module.exports = router;
