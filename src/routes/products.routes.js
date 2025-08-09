const express = require('express');

const router = express.Router();

const { publishaproduct, updateproductprice, updatethecountinstockofproduct,updatethenamedescriptionandrichdescriptionoftheproduct, updatethemainimageoftheproduct, updateisfeaturedoftheproduct, toggleisactiveoftheproduct, uploadmoreimages, deleteimages, adddiscountintheproduct,gettheproductdetail,getsalesoftheproduct, addmorevariantsoftheproduct, deleteavariantintheproduct, getactiveproductsoftheuser, getalltheproductsoftheuser, getisfeaturedproductsoftheuser } = require("../controllers/products.controllers");

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

router.route("/:productId/updatediscount-product").patch(authorization,adddiscountintheproduct);

router.route("/:productId/getproductdetail").get(authorization,gettheproductdetail);

router.route("/:productId/getthesalesoftheproduct").get(authorization,getsalesoftheproduct);

router.route("/:productId/update-more-variant-inthe-product").patch(authorization,addmorevariantsoftheproduct);

router.route("/:productId/:variantId/delete-variant").delete(authorization,deleteavariantintheproduct);

router.route("/:userid/get-all-theactive-products-of-the-user").get(authorization,getactiveproductsoftheuser);

router.route("/:userId/get-all-the-products-of-the-user").get(authorization,getalltheproductsoftheuser);

router.route("/:userId/get-isfeatured-product").get(authorization,getisfeaturedproductsoftheuser);





module.exports = router;