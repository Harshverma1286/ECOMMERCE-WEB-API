const express = require('express');

const router = express.Router();

const { publishaorder, getthetotalamountoftheorderwithorderid, updatetheorderstatus, gettherespectiveorderdetailswithorderid } = require("../controllers/orders.controllers");

const authorization = require('../middlewares/authorization.middlewares');

router.route("/publishaorder").post(authorization,publishaorder);

router.route("/:orderId/getthefullamountoftheorder").get(authorization,getthetotalamountoftheorderwithorderid);

router.route("/:orderId/:value/updateorderstatus").patch(authorization,updatetheorderstatus);

router.route("/:orderId/gettheorderdetails").get(authorization,gettherespectiveorderdetailswithorderid);







module.exports = router;





