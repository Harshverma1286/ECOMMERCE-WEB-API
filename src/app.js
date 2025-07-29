const express = require('express');

const app = express();

const cookieparser = require('cookie-parser');

const jwt = require('jsonwebtoken');

const cors = require('cors');

app.use(cors());

app.use(express.json({limit:"16kb"}));

app.use(express.urlencoded({extended:true}));

app.use(cookieparser());

app.use(express.static("public"));

const userrouter = require("./routes/user.routes");


app.use("/api/v1/users",userrouter);


module.exports = app;

