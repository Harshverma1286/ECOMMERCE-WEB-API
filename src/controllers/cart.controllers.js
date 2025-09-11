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


module.exports = {addaproductinthecart,createacart};
