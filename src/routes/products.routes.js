const express = require('express');

const router = express.Router();

const { publishaproduct, updateproductprice, updatethecountinstockofproduct,updatethenamedescriptionandrichdescriptionoftheproduct, updatethemainimageoftheproduct, updateisfeaturedoftheproduct, toggleisactiveoftheproduct, uploadmoreimages, deleteimages, adddiscountintheproduct,gettheproductdetail,getsalesoftheproduct, addmorevariantsoftheproduct, deleteavariantintheproduct, getactiveproductsoftheuser, getalltheproductsoftheuser, getisfeaturedproductsoftheuser, getproductbybrand, getthevariantsoftheproduct, getspecificvariantoftheproduct, updatethesalescountoftheproduct } = require("../controllers/products.controllers");

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

router.route("/:brandName/get-product-by-brandname").get(authorization,getproductbybrand);

router.route("/:productId/get-all-thevariants-oftheproduct").get(authorization,getthevariantsoftheproduct);

router.route("/:productId/:variantId/get-a-specific-variantoftheproduct").get(authorization,getspecificvariantoftheproduct);

router.route("/:productId/updatethesalescountoftheproduct").patch(authorization,updatethesalescountoftheproduct);





module.exports = router;