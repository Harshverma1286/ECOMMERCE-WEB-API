const express = require('express');

const router = express.Router();

const { publishaproduct, updateproductprice, updatethecountinstockofproduct,updatethenamedescriptionandrichdescriptionoftheproduct, updatethemainimageoftheproduct, updateisfeaturedoftheproduct } = require("../controllers/products.controllers");

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

router.route("/:productId/update-price").patch(authorization,updateproductprice);

router.route("/:productId/update-stock").patch(authorization,updatethecountinstockofproduct);

router.route("/:productId/update-details").patch(authorization,updatethenamedescriptionandrichdescriptionoftheproduct);

router.route("/:productId/update-main-image").patch(
    upload.single("image"),
    authorization,
    updatethemainimageoftheproduct
);

router.route("/:productId/update-isfeatured").patch(authorization,updateisfeaturedoftheproduct);





module.exports = router;