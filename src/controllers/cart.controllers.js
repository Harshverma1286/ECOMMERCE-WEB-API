const mongoose = require('mongoose');

const asynchandler = require('../utils/asynchandler');

const apierror = require("../utils/apierror");

const apiresponse = require("../utils/apiresponse");

const Cart = require("../models/cart.models");

const User = require("../models/users.models");

const Product = require("../models/products.models");

const addaproductinthecart = asynchandler(async(req,res)=>{
    const {cartID} = req.params;

    if(!cartID){
        throw new apierror(400,"cartid is required");
    }


    const cart = await Cart.findById(cartID)

    if(!cart){
        throw new apierror(404,"cart does not exist");
    }

    const {product,quantity,variant} = req.body;

    if(!product){
        throw new apierror("product is required");
    }

    const checkproduct = await Product.findById(product);

    if(!checkproduct){
        throw new apierror(400,"product does not exist");
    }

    if(!quantity|| quantity<=0 || isNaN(quantity)){
        throw new apierror(400,"plz provide the quantity correctly");
    }

    if(!variant || !variant.color || !variant.size){
        throw new apierror(400,"variant must include size and color");
    }

    const cartitem = {
        product:checkproduct._id,
        quantity,
        variant,
    }

    cart.items.push(cartitem);

    await cart.save();

    return res.status(200).json(
        new apiresponse(200,cart,"items added to the cart successfully")
    )
});


const createacart = asynchandler(async(req,res)=>{
    const createacart = await Cart.create({
        user:req.user._id,
        items:[],
    })

    if(!createacart){
        throw new apierror(500,"something went wrong while creating cart");
    }

    return res.status(200).json(
        new apiresponse(200,createacart,"cart created of the user successfully")
    )
});

const getalltheitemsinthecart = asynchandler(async(req,res)=>{
    const {cartID} = req.params;

    if(!cartID){
        throw new apierror(400,"cart id is required");
    }

    const cart = await Cart.findById(cartID).populate({
        path: "items.product",
        select: "name price image brand countinstock",
    });

    if(!cart){
        throw new apierror(404,"cart not found");
    }

    return res.status(200).json(
        new apiresponse(200,cart,"cart details fetched successfully")
    )


})

const removeaproductformthecart = asynchandler(async(req,res)=>{
    const {cartID,productId} = req.params;

    if(!cartID){
        throw new apierror(400,"cartId is required");
    }

    if(!productId){
        throw new apierror(400,"product id is required");
    }

    const cart = await Cart.findById(cartID);

    if(!cart){
        throw new apierror(404,"cart not found");
    }

    const product = await Product.findById(productId);

    if(!product){
        throw new apierror(400,"product not found");
    }

    const check = cart.items.some((prod)=>{
        return prod.product._id.toString()===productId.toString()
    })

    if(!check){
        throw new apierror(404,"product you want to delete does not exist in the card");
    }

    const cartitems = cart.items.filter((prod)=>{
        return prod.product._id.toString()!==productId.toString();
    })

    cart.items = cartitems;

    await cart.save();

    return res.status(200).json(
        new apiresponse(200,cartitems,"cart item removed successfully")
    )
});


module.exports = {addaproductinthecart,createacart,getalltheitemsinthecart,removeaproductformthecart};
