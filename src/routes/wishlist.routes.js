const express = require('express');

const router = express.Router();

const authorization = require("../middlewares/authorization.middlewares");

const { createthewishlist, addaproductinthewishlist, removeaproductfromthewishlist } = require("../controllers/wishlist.controllers");



router.route("/:productId/createawishlist").post(authorization,createthewishlist);

router.route("/:wishlistId/:productId/addaproductinwishlist").post(authorization,addaproductinthewishlist);

router.delete(
    "/:wishlistId/products/:productId",
    authorization,
    removeaproductfromthewishlist
);

module.exports = router;