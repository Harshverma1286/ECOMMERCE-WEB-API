const express = require('express');

const router = express.Router();

const authorization = require("../middlewares/authorization.middlewares");

const { createthewishlist, addaproductinthewishlist, removeaproductfromthewishlist, getalltheproductsintthewishlist } = require("../controllers/wishlist.controllers");



router.route("/:productId/createawishlist").post(authorization,createthewishlist);

router.route("/:wishlistId/:productId/addaproductinwishlist").post(authorization,addaproductinthewishlist);

router.delete(
    "/:wishlistId/products/:productId",
    authorization,
    removeaproductfromthewishlist
);

router.route("/:wishlistId/getalltheproductsdetailsinthewishlist").get(authorization,getalltheproductsintthewishlist);

module.exports = router;