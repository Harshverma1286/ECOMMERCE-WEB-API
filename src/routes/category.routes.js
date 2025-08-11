const express = require('express');

const router = express.Router();

const { publishacategory } = require("../controllers/category.controllers");


const authorization = require("../middlewares/authorization.middlewares");

router.route("/publish-a-category").post(authorization,publishacategory);



module.exports = router;