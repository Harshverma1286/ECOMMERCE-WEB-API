const express = require('express');

const router = express.Router();

const authorization = require("../middlewares/authorization.middlewares");

const { createthewishlist } = require("../controllers/wishlist.controllers");



router.route("/:productId/createawishlist").post(authorization,createthewishlist);

module.exports = router;