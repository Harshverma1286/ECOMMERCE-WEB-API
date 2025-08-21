const mongoose = require('mongoose');

const asynchandler = require("../utils/asynchandler");

const apierror = require("../utils/apierror");

const apiresponse = require("../utils/apiresponse");

const Product = require("../models/products.models");

const User = require("../models/users.models");
const { all } = require('../app');


const publishaorder = asynchandler(async(req,res)=>{
    const {orderitems,shippinginfo} = req.body;  

    const allitemsinorderitems = ["product","quantity","priceatpackage"];

    if(!Array.isArray(orderitems) || orderitems.length===0){
        throw new apierror(400,"plz provide the orderitems");
    }

    orderitems.forEach((item,index)=>{
        allitemsinorderitems.forEach((allitems)=>{
            if(item[allitems]===undefined || item[allitems]===null){
                throw new apierror(400,`Order item at index ${index} is missing required field: ${allitems}`);
            }


            if(typeof item.quantity!=="number" && item.quantity<=0){
                throw new apierror(400,`Order item at index ${index} mujst have a value greater than zero`);
            }

            if (typeof item.priceatpackage !== "number" || item.priceatpackage < 0) {
                throw new apierror(400, `Order item at index ${index} must have a valid price`);
            }
        })
    });



})




module.exports = {};