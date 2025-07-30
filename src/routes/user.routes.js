const express = require('express');

const router = express.Router();

const { registeruser, loginuser, logoutuser } = require("../controllers/user.controllers");

const upload = require("../middlewares/multer.middlewares");


router.route("/registeruser").post(
    upload.single("avatar"),
    registeruser,
);

router.route("/loginuser").post(loginuser);

router.route("/logoutuser",logoutuser);





module.exports = router;