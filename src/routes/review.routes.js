const express = require('express');

const router = express.Router();

const { publishareview } = require("../controllers/review.controllers");

const authorization = require("../middlewares/authorization.middlewares");


router.route("/:productId/publishareview").post(authorization,publishareview);




module.exports = router;