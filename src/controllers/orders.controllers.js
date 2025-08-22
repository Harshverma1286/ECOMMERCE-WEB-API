const mongoose = require('mongoose');

const asynchandler = require("../utils/asynchandler");

const apierror = require("../utils/apierror");

const apiresponse = require("../utils/apiresponse");

const Product = require("../models/products.models");

const User = require("../models/users.models");

const Order = require("../models/order.models");
const { all } = require('../app');


const publishaorder = asynchandler(async(req,res)=>{
    const {orderitems,shippinginfo,comment} = req.body;  

    const allitemsinorderitems = ["product","quantity","priceatpackage"];

    const shippinginfoaddress = ["line1","line2","city","state","zip","phone","country"];

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

    if(!shippinginfo || typeof shippinginfo!=="object"){
        throw new apierror(400,"plz provide the correct way");
    }

    shippinginfoaddress.forEach((field)=>{
        if(!shippinginfo[field]?.trim() || typeof shippinginfo[field]!=="object"){
            throw new apierror(400,`shipping info has an invalid field that is ${field}`)
        }
    })


    const user = await User.findById(req.user._id);

    if(!user){
        throw new apierror(400,"user details not found");
    }

    let isaddresscorrect = false;
    user.address.forEach((eachaddress)=>{
        let match = true;
        shippinginfo.forEach((pervalue)=>{
            if(shippinginfo[pervalue]!=eachaddress[pervalue]){
                match = false;
            }
        })
        if(match===true){
            isaddresscorrect=true;
        }
    })

    if(!isaddresscorrect){
        throw new apierror(400,"the following address is not correct kindly add the address first");
    }

    const createorder = await Order.create({
        user:req.user._id,
        orderitems,
        shippinginfo,
        orderstatus:"processing",
        comment:comment || "",
    })

    if(!createorder){
        throw new apierror(500,"something went wrong while creating order");
    }

    let getfullprice =  createorder.getfullprice(orderitems);

    createorder.totalamount = getfullprice;

    await createorder.save();

    return res.status(200).json(
        new apiresponse(200,createorder,"order published successfully")
    )

});




module.exports = {publishaorder};