const express = require('express');

const router = express.Router();

const authorization = require("../middlewares/authorization.middlewares");

const { addaproductinthecart, createacart, getalltheitemsinthecart } = require("../controllers/cart.controllers");

router.route("/:cartID/additemsinthecart").post(authorization,addaproductinthecart);

router.route("/publishacart").post(authorization,createacart);

router.route("/:cartID/getallitemsincart").get(authorization,getalltheitemsinthecart);


module.exports = router;