const mongoose = require('mongoose');

const asynchandler = require('../utils/asynchandler');

const apierror = require("../utils/apierror");

const apiresponse = require("../utils/apiresponse");

const User = require("../models/users.models");

const Product = require("../models/products.models");

const Review = require("../models/review.models");

const publishareview = asynchandler(async(req,res)=>{
    const {ProductId} = req.params;

    if(!ProductId){
        throw new apierror(400,"product id is required");
    }

    const product = await Product.findById(ProductId);

    if(!product){
        throw new apierror(404,"product not found");
    }


    const {comment,rating} = req.body;

    const numrating = Number(rating);

    if(isNaN(numrating) || numrating<0 || numrating>5){
        throw new apierror(400,"plz provide the correct rating");
    }

    const existingReview = await Review.findOne({ user: req.user._id, product: ProductId });
    if (existingReview) {
            throw new apierror(400, "You have already reviewed this product");
    }


    const review = await Review.create({
        user:req.user._id,
        product:ProductId,
        comment:comment || "",
        rating:rating,
    })

    if(!review){
        throw new apierror(500,"review not created yet something went wrong");
    }


    return res.status(200).json(
        new apiresponse(200,review,"review and rating added successfully")
    )
});




module.exports = {publishareview};