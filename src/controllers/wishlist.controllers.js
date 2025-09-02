const mongoose = require('mongoose');

const asynchandler = require("../utils/asynchandler");

const apierror = require("../utils/apierror");

const apiresponse = require("../utils/apiresponse");

const User = require("../models/users.models");

const Product = require("../models/products.models");

const Wishlist = require("../models/wishlists.model");

const createthewishlist = asynchandler(async(req,res)=>{
    const {ProductId} = req.params;

    if(!ProductId){
        throw new apierror(400,"product id is required");
    }

    const product = await Product.findById(ProductId);

    if(!product){
        throw new apierror(404,"product not found");
    }

    let wishlist = await Wishlist.findOne({user:req.user._id});

    if(!wishlist){
        wishlist = await Wishlist.create({
            user:req.user._id,
            products:[ProductId]
        });
    }
    else{
        if(wishlist.products.includes(ProductId)){
            throw new apierror(400,"product is already in the wishlist");
        }
    }

    wishlist.products.push(ProductId);

    await wishlist.save();

    
    return res.status(200).json(
        new apiresponse(200,wishlist,"wishlist of the user created successfully")
    )

});


module.exports = {createthewishlist};