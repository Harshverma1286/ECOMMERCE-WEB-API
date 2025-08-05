const express = require('express');

const router = express.Router();

const { publishaproduct, updateproductprice, updatethecountinstockofproduct,updatethenamedescriptionandrichdescriptionoftheproduct, updatethemainimageoftheproduct, updateisfeaturedoftheproduct, toggleisactiveoftheproduct, uploadmoreimages, deleteimages } = require("../controllers/products.controllers");

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

router.route("/:productId/update-isactivefeature").patch(authorization,toggleisactiveoftheproduct);

router.route("/:productId/update-more-images").patch(
    upload.fields([
        {
            name:"images",
            maxCount:5,
        }
    ]),
    authorization,
    uploadmoreimages
);

router.route("/:productId/imageId/:imagesId/delete-image").delete(authorization,deleteimages);





module.exports = router;