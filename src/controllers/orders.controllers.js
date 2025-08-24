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

const getthetotalamountoftheorderwithorderid = asynchandler(async(req,res)=>{
    const {orderId} = req.params;

    if(!orderId){
        throw new apierror(400,"order id is required");
    }


    const order = await Order.findById(orderId);

    if(!order){
        throw new apierror(404,"order not found");
    }

    return res.status(200).json(
        new apiresponse(200,order.totalamount,"total amount of the order fetched successfully")
    )
});

const updatetheorderstatus = asynchandler(async(req,res)=>{
    const {orderId,value} = req.params;


    if(!orderId){
        throw new apierror(400,"order id is not there");
    }

    const order = await Order.findById(orderId);

    if(!order){
        throw new apierror(404,"order not found")
    }

    if(!value || typeof value!=="string"){
        throw new apierror(400,"kindly provide me the respective field to update");
    }

    if(order.orderstatus===value){
        throw new apierror(400,"the field is the same kindly provide different field to update");
    }

    if(!req.user.isadmin){

        const isowner = order.orderitems.some((item)=>{
            item.Product.owner.toString()===req.user._id.toString();
        })


         if (!isowner) {
            throw new apierror(403, "You are not authorized to update this order");
        }
    }

    let allfields = ["processing","shipped","delivered","cancelled"];

    let check = false;

    allfields.forEach((val)=>{
        let ans = false;
        if(val===value){
            ans=true;
        }
        if(ans===true){
            check = true;
        }
    })

    if(!check){
        throw new apierror(400,"plz provide the correct value to update the values should be processing,shipped,delivered,cancelled");
    }

    if(value==="delivered"){
        order.deliveredat = Date.now();
    }


    order.orderstatus = value;

    await order.save();

    return res.status(200).json(
        new apiresponse(200,order,"order status updated successfully")
    )
});


const gettherespectiveorderdetailswithorderid = asynchandler(async(req,res)=>{
    const {orderId} = req.params;

    if(!orderId){
        throw new apierror(400,"order id not found");
    }

    const order = await Order.findById(orderId);

    if(!order){
        throw new apierror(404,"order not found");
    }


    return res.status(200).json(
        new apiresponse(200,order,"order details fetched successfully")
    )
});

const gettheorderstatuswithorderid = asynchandler(async(req,res)=>{
    const {orderId} = req.params;

    if(!orderId){
        throw new apierror(400,"orderid is required");
    }

    const order = await Order.findById(orderId);

    if(!order){
        throw new apierror(404,"order not found");
    }

    return res.status(200).json(
        new apiresponse(200,{orderstatus:order.orderstatus},"order status fetched successfully")
    )

});


const getallordersoftheuser = asynchandler(async(req,res)=>{
    const {userId} = req.params;

    if(!userId){
        throw new apierror(400,"userid not recived");
    }

    const user = await User.findById(userId).select(
        "-password -refreshtoken"
    )

    if(!user){
        throw new apierror(404,"user not found");
    }

    const allorders = await Order.aggregate([
        {
            $match:{
                user:new mongoose.Types.ObjectId(userId),
            }
        },
        {
            $lookup:{
                from:"products",
                localField:"orderitems.products",
                foreignField: "_id",
                as: "productdetails"
            }
        },
        {
            $project:{
                user:1,
                orderitems:1,
                shippinginfo:1,
                totalamount:1,
                orderstatus:1,
                deliveredat:1,
                comment:1,
                createdAt: 1,
                updatedAt: 1,
                productdetails:{
                    name:1,
                    description:1,
                    image:1,
                    images:1,
                    brand:1,
                    price:1,
                    owner:1,
                }
            }
        }
    ]);

    if(!allorders || allorders.length===0){
        throw new apierror(400,"there are no order of the user");
    }

    return res.status(200).json(
        new apiresponse(200,{
            userinfo:user,
            allorders:allorders
        })
    )
})

const getdeleviredatdateoftheorder = asynchandler(async(req,res)=>{
    const {orderId} = req.params;

    if(!orderId){
        throw new apierror(400,"order id not recived");
    }


    const order = await Order.findById(orderId);

    if(!order){
        throw new apierror(404,"order not found");
    }


    return res.status(200).json(
        new apiresponse(200,{delvereddate:order.deliveredat},"delivereddatefetched successfully")
    )
})









module.exports = {publishaorder,getthetotalamountoftheorderwithorderid,updatetheorderstatus,gettherespectiveorderdetailswithorderid,gettheorderstatuswithorderid,getallordersoftheuser,getdeleviredatdateoftheorder};