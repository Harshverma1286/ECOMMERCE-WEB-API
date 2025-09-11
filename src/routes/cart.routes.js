const express = require('express');

const router = express.Router();

const authorization = require("../middlewares/authorization.middlewares");

const { addaproductinthecart, createacart } = require("../controllers/cart.controllers");

router.route("/:cartID/additemsinthecart").post(authorization,addaproductinthecart);

router.route("/publishacart").post(authorization,createacart);


module.exports = router;