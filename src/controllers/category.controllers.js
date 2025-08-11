const mongoose = require('mongoose');

const asynchandler = require("../utils/asynchandler");

const apierror = require("../utils/apierror");

const apiresponse = require("../utils/apiresponse");

const Category = require("../models/category.models");

const {uploadoncloudinary,deletefromcloudinary} = require("../utils/cloudinary")

const publishacategory = asynchandler(async(req,res)=>{
    const {name,color,description} = req.body;

    if(!name?.trim()){
        throw new apierror(400,"name of the category is required");
    }

    if(!color?.trim()){
        throw new apierror(400,"color is required");
    }

    if(!description?.trim()){
        throw new apierror(400,"description is required");
    }

    const findname = await Category.findOne({name});

    if(findname){
        throw new apierror(400,"category already exist");
    }

    const iconpath = req.files?.icon?.[0]?.path;

    if(!iconpath){
        throw new apierror(400,"iconpath is required");
    }

    const uploadingicon = await uploadoncloudinary(iconpath);

    const bannerimagepath = req.files?.banner?.[0]?.path;


    const upladingbanner = bannerimagepath ? await uploadoncloudinary(bannerimagepath) : null ;

    const createcategory = await Category.create({
        name,
        color,
        description,
        icon:uploadingicon.url,
        bannerimage:upladingbanner?.url || "",
    })


    if(!createcategory){
        throw new apierror(500,"something went wrong");
    }

    return res.status(200).json(
        new apiresponse(200,createcategory,"category created successfully")
    )
})



module.exports = {publishacategory};