const express = require('express');

const router = express.Router();

const { publishaproduct, updateproductprice, updatethecountinstockofproduct } = require("../controllers/products.controllers");

const upload = require("../middlewares/multer.middlewares");

const authorization = require("../middlewares/authorization.middlewares");

router.route("/publishaproduct").post(
    upload.fields([
        {name:"image",
            maxCount:1,
        },
        {
            name:"images",
            maxCount:5
        }
    ]),
    authorization,
    publishaproduct,
);

router.route("/updateprice/productid/:productId").patch(authorization,updateproductprice);

router.route("/updatethecountinstock/productid/:productId").patch(authorization,updatethecountinstockofproduct);





module.exports = router;