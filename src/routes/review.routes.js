const express = require('express');

const router = express.Router();

const { publishareview, updatethecomment, gettheproductallreviews, getalltheuserreviewwithproductinfoinit, getthecommentandratingoftheuserwithreviewid } = require("../controllers/review.controllers");

const authorization = require("../middlewares/authorization.middlewares");


router.route("/:productId/publishareview").post(authorization,publishareview);

router.route("/:reviewId/updatethereview").patch(authorization,updatethecomment);

router.route("/:productId/getallproductsreview").get(authorization,gettheproductallreviews);

router.route("/userId/getallthereviewoftheuser").get(authorization,getalltheuserreviewwithproductinfoinit);

router.route("/:reviewId/getthecommentandratingwithreviewid").get(authorization,getthecommentandratingoftheuserwithreviewid);




module.exports = router;