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

const updatethecomment = asynchandler(async(req,res)=>{
    const {reviewId} = req.params;

    if(!reviewId){
        throw new apierror(400,"review id is required");
    }

    const review = await Review.findById(reviewId);

    if(!review){
        throw new apierror(404,"review not found");
    }

    if (review.user.toString() !== req.user._id.toString()) {
        throw new apierror(403, "You are not allowed to update this review");
    }

    const {comment} = req.body;

    if(!comment?.trim()){
        throw new apierror(400,"kindly provide the comment to update");
    }

    review.comment = comment;

    await review.save();

    return res.status(200).json(
        new apiresponse(200,review,"comment updated successfully")
    )
});

const gettheproductallreviews = asynchandler(async(req,res)=>{
    const {ProductId} = req.params;

    if(!ProductId){
        throw new apierror(400,"product id is required");
    }

    const product = await product.findById(ProductId);

    if(!product){
        throw new apierror(404,"product not found");
    }


    const getallreviews = await Review.aggregate([
        {
            $match:{
                product:new mongoose.Types.ObjectId(ProductId),
            }
        }
    ]);

    if(getallreviews.length===0){
        throw new apierror(404,"there are no review on this product");
    }


    return res.status(200).json(
        new apiresponse(200,{product,getallreviews},"all the reviews fetched successfully of the product")
    )
});


const getalltheuserreviewwithproductinfoinit = asynchandler(async(req,res)=>{
    const {userId} = req.params;

    if(!userId){
        throw new apierror(400,"user id is required");
    }


    const findreviewoftheuser = await Review.aggregate([
        {
            $match:{
                user:new mongoose.Types.ObjectId(userId),
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "userdetails"
            }
        },
        {
            $unwind:"$userdetails"
        },
        {
            $project:{
                _id: 1,
                rating: 1,
                comment: 1,
                createdAt: 1,
                "userdetails._id": 1,
                "userdetails.username": 1,
                "userdetails.email": 1,
            }
        },
        {
            $lookup:{
                from: "products",
                localField: "product",
                foreignField: "_id",
                as: "productinfo"                
            }
        },
        {
            $unwind:"$productinfo"
        },
        {
            $project: {
                _id: 1,
                rating: 1,
                comment: 1,
                createdAt: 1,
                "productInfo._id": 1,
                "productInfo.name": 1,
                "productInfo.description": 1,
                "productInfo.price": 1,
                "productInfo.image": 1,
                "productInfo.rating": 1
            }
        }
    ]);


    if(findreviewoftheuser.length===0){
        throw new apierror(400,"user has no reviews");
    }

    return res.status(200).json(
        new apiresponse(200,findreviewoftheuser,"successfully fetched all the reviews with product info in it")
    )
});




module.exports = {publishareview,
    updatethecomment,
gettheproductallreviews,
getalltheuserreviewwithproductinfoinit,
};