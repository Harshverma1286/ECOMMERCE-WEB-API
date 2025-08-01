const express = require('express');

const router = express.Router();

const { registeruser, loginuser, logoutuser, generateaccesstoken, updateusernameemailandfullname, updatepassword, updateavatar, addanewadress, deleteanaddress, getuserprofile, updateaddress } = require("../controllers/user.controllers");

const upload = require("../middlewares/multer.middlewares");

const authorization = require("../middlewares/authorization.middlewares");


router.route("/registeruser").post(
    upload.single("avatar"),
    registeruser,
);

router.route("/loginuser").post(loginuser);

router.route("/logoutuser").post(authorization,logoutuser);

router.route("/generateaccesstoken").post(generateaccesstoken);

router.route("/updateusernameemailorfullname").patch(authorization,updateusernameemailandfullname);


router.route("/updatepassword").patch(authorization,updatepassword);

router.route("/updateavatar").patch(
    upload.single("avatar"),
    authorization
    ,updateavatar);


router.route("/addanewaddress").post(authorization,addanewadress);

router.route("/deleteaddress/addressID/:addressId").delete(authorization,deleteanaddress);

router.route("/getuserprofile").get(authorization,getuserprofile);

router.route("/updateaddress/addressid/:addressId").patch(authorization,updateaddress);







module.exports = router;