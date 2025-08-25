const express = require('express');

const router = express.Router();

const { publishaorder, getthetotalamountoftheorderwithorderid, updatetheorderstatus, gettherespectiveorderdetailswithorderid, gettheorderstatuswithorderid, getallordersoftheuser, getdeleviredatdateoftheorder, getcommentoftherespectiveorder, getshippinginfooftherespectiveorder } = require("../controllers/orders.controllers");

const authorization = require('../middlewares/authorization.middlewares');

router.route("/publishaorder").post(authorization,publishaorder);

router.route("/:orderId/getthefullamountoftheorder").get(authorization,getthetotalamountoftheorderwithorderid);

router.route("/:orderId/:value/updateorderstatus").patch(authorization,updatetheorderstatus);

router.route("/:orderId/gettheorderdetails").get(authorization,gettherespectiveorderdetailswithorderid);

router.route("/:orderId/getorderstatus").get(authorization,gettheorderstatuswithorderid);

router.route("/:userId/getallorderoftheuser").get(authorization,getallordersoftheuser);

router.route("/:orderId/Getdelivereddate").get(authorization,getdeleviredatdateoftheorder);

router.route("/:orderId/getcommentoftheorder").get(authorization,getcommentoftherespectiveorder);

router.route("/:orderId/getshippinfoofarespectiveorder").get(authorization,getshippinginfooftherespectiveorder);







module.exports = router;





