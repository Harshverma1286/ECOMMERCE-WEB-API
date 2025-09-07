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

const addaproductinthewishlist = asynchandler(async(req,res)=>{
    const {wishlistId,productId} = req.params;

    if(!wishlistId){
        throw new apierror(400,"wishlist id is required");
    }

    if(!productId){
        throw new apierror(400,"product id is required");
    }


    const wishlist = await Wishlist.findById(wishlistId);

    if(!wishlist){
        throw new apierror(404,"wishlist does not exist");
    }

    const product = await Product.findById(productId);

    if(!product){
        throw new apierror(404,"product not found");
    }


   if(wishlist.products.some(p=>p.toString()===productId)){
    throw new apierror(400,"product already exist in the wishlist");
   }

    if(wishlist.user.toString()!==req.user._id.toString()){
        throw new apierror(403,"access denied");
    }

    wishlist.products.push(productId);

    await wishlist.save();


    return res.status(200).json(
        new apiresponse(200,wishlist,"products added in the wishlist successfully")
    )
})

const removeaproductfromthewishlist = asynchandler(async(req,res)=>{
    const {productId,wishlistId} = req.params;

    if(!productId){
        throw new apierror(400,"product id not found");
    }

    const product = await Product.findById(productId);

    if(!product){
        throw new apierror(404,"product does not exist");
    }

    if(!wishlistId){
        throw new apierror(400,"wishlistId is required");
    }

    const wishlist = await Wishlist.findById(wishlistId);

    if(!wishlist){
        throw new apierror(404,"wishlist does not exist of the user");
    }

    if(wishlist.user.toString()!==req.user._id.toString()){
        throw new apierror(403,"you are not permitted to remove the product from the wishlist");
    }

    const ifitis = wishlist.products.some((product)=> product._id.toString()===productId.toString());

    if(!ifitis){
        throw new apierror(404,"product does not exist in the wishlist");
    }

    wishlist.products = wishlist.products.filter((product)=> product._id.toString()!==productId.toString());

    await wishlist.save();

    return res.status(200).json(
        new apiresponse(200,{},"product removed from the wishlist successfully")
    )

});

const getalltheproductsintthewishlist = asynchandler(async(req,res)=>{
    const {wishlistId} = req.params;

    if(!wishlistId){
        throw new apierror(400,"wishlist id is required");
    }

    const wishlist = await Wishlist.findById(wishlistId);

    if(!wishlist){
        throw new apierror(404,"wishlist does not exist");
    }

    const productdetails = Wishlist.aggregate([
        {
            $match:{_id:new mongoose.Schema.Types.ObjectId(wishlistId)},
        },
        {
            $lookup: {
                from: "products",         
                localField: "products",       
                foreignField: "_id",          
                as: "productDetails"         
            }
        },
        {
            $project:{
                _id:0,
                productdetails:1,
            }
        }
    ])

    if(!productdetails || productdetails.length===0){
        throw new apierror(404,"there are no products in the wishlist");
    }

    return res.status(200).json(
        new apiresponse(200,productdetails,"fetched all the product details in the product")
    )

});

module.exports = {createthewishlist,
    addaproductinthewishlist,
    removeaproductfromthewishlist,
    getalltheproductsintthewishlist,
};