const express = require('express');

const router = express.Router();

const { registeruser } = require("../controllers/user.controllers");

const upload = require("../middlewares/multer.middlewares");


router.route("/registeruser").post(
    upload.single("avatar"),
    registeruser,
);



module.exports = router;