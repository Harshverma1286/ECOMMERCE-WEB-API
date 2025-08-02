const mongoose = require('mongoose');

const asynchandler = require("../utils/asynchandler");

const apierror = require("../utils/apierror");

const apiresponse = require("../utils/apierror");

const Products = require("../models/products.models");

const {uploadoncloudinary,deletefromcloudinary} = require("../utils/cloudinary");

const Category = require("../models/category.models");



const publishaproduct = asynchandler(async(req,res)=>{
    const {name,description,richdescription,brand,price,category,countinstock,discount,variants} = req.body;

    if(!name){
        throw new apierror(400,"name of the product is required");
    }

    if(!description){
        throw new apierror(400,"description is required");
    }

    if(!brand){
        throw new apierror(400,"brand is required");
    }

    if(price===undefined){
        throw new apierror(400,"price is required for the product");
    }

    if(!category){
        throw new apierror(400,"category is required for the product");
    }

    const categorycheck = await Category.findbyId(category);

    if(!categorycheck){
        throw new apierror(400,"the required category is not found ");
    }

    if(countinstock===undefined){
        throw new apierror(400,"stock of the product is required now");
    }

    const imagepath = req.files?.image?.[0]?.path;

    const extraimages = req.files?.images?.map(file=> file.path);
    if(!imagepath){
        throw new apierror(400,"image of the product is required");
    }

    const uplaodit = await uploadoncloudinary(imagepath);

    if(!uplaodit){
        throw new apierror(400,"something went wrong while uploading");
    }


    const uplaodextra = extraimages? await Promise.all(extraimages.map(img=> uploadoncloudinary(img))):[];

    const createproduct = await Products.create({
        name,
        description,
        richdescription:richdescription||"",
        brand,
        price,
        category:category,
        countinstock,
        discount:discount||0,
        variants:variants||[],
        image:uplaodit.url,
        images: uplaodextra.map(file=>file.url),
        owner:req.user._id,
    });

    if(!createproduct){
        throw new apierror(500,"something went wrong while creating product");
    }


    return res.status(200).json(
        new apiresponse(200,createproduct,"product created successfully")
    )
});




module.exports = {publishaproduct};