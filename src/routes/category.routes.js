const express = require('express');

const router = express.Router();

const { publishacategory, getalltheproductswiththiscategory } = require("../controllers/category.controllers");

const upload = require("../middlewares/multer.middlewares");


const authorization = require("../middlewares/authorization.middlewares");

router.route("/publish-a-category").post(
    upload.fields([
        {
            name:icon,
            maxCount:1,
        },
        {
            name:banner,
            maxCount:1,
        }
    ]),
    authorization,publishacategory);

  router
  .route("/:categoryId/products/getalltheproductsbycategory")
  .get(authorization, getalltheproductswiththiscategory);



module.exports = router;