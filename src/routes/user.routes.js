const express = require('express');

const router = express.Router();

const { registeruser, loginuser, logoutuser, generateaccesstoken, updateusernameemailandfullname } = require("../controllers/user.controllers");

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









module.exports = router;