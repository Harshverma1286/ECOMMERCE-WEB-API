const express = require('express');

const router = express.Router();

const { publishacategory, getalltheproductswiththiscategory, toggleisactivecategory, getdetailsofthecategorybycategoryid, getallactivecategories, getallthecategories } = require("../controllers/category.controllers");

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

  router.route("/:categoryId/toogle-isactive-ofthecategory").patch(authorization,toggleisactivecategory);

  router.route("/:categoryId/getdetailsbycategoryid").get(authorization,getdetailsofthecategorybycategoryid);

  router.route("/getalltheactivecategory").get(authorization,getallactivecategories);

  router.route("/getallcategory").get(authorization,getallthecategories);



module.exports = router;