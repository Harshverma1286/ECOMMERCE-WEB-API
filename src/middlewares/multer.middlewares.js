const multer = require('multer');

const path = require('path');



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp")
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
})

const upload = multer({ storage: storage });

module.exports = upload;