require("dotenv").config({
    path:'./.env'
});
const express = require('express');

const app = require("./app");


const mongoose = require('mongoose');

const {DB_NAME} = require('./constants');
const connectdb = require("./db");



connectdb().then(
    ()=>{
        app.on('error',(error)=>{
            console.log("err",error);
            throw error
        });

        app.listen(process.env.PORT || 3000,function(){
            console.log(`the app is successfully working on port ${process.env.PORT}`);
        })
    }
).catch(
    (err)=>{
        console.log("err",err);
    }
);




