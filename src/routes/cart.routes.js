const express = require('express');

const router = express.Router();

const authorization = require("../middlewares/authorization.middlewares");

const { addaproductinthecart, createacart, getalltheitemsinthecart, removeaproductformthecart } = require("../controllers/cart.controllers");

router.route("/:cartID/additemsinthecart").post(authorization,addaproductinthecart);

router.route("/publishacart").post(authorization,createacart);

router.route("/:cartID/getallitemsincart").get(authorization,getalltheitemsinthecart);

router.route("/:cartId/:productId/removeaproductfromthecart").delete(authorization,removeaproductformthecart);


module.exports = router;