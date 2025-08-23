const express = require('express');

const router = express.Router();

const { publishaorder, getthetotalamountoftheorderwithorderid, updatetheorderstatus } = require("../controllers/orders.controllers");

const authorization = require('../middlewares/authorization.middlewares');

router.route("/publishaorder").post(authorization,publishaorder);

router.route("/:orderId/getthefullamountoftheorder").get(authorization,getthetotalamountoftheorderwithorderid);

router.route("/:orderId/updateorderstatus").patch(authorization,updatetheorderstatus);







module.exports = router;





