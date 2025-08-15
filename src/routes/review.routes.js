const express = require('express');

const router = express.Router();

const { publishareview, updatethecomment } = require("../controllers/review.controllers");

const authorization = require("../middlewares/authorization.middlewares");


router.route("/:productId/publishareview").post(authorization,publishareview);

router.route("/:reviewId/updatethereview").patch(authorization,updatethecomment);




module.exports = router;