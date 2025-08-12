const mongoose = require('mongoose');

const asynchandler = require("../utils/asynchandler");

const apierror = require("../utils/apierror");

const apiresponse = require("../utils/apiresponse");

const Product = require("../models/products.models");
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

const getalltheproductswiththiscategory = asynchandler(async(req,res)=>{
    const {categoryId} = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    if(!categoryId){
        throw new apierror(400,"category id is required");
    }

    const category = await Category.findById(categoryId);

    if(!category){
        throw new apierror(404,"category not found");
    }


    const getalltheproductswiththiscategory = await Product.aggregate([
        {
            $match:{category:new mongoose.Types.ObjectId(categoryId)}
        },
        {
         
            $sort: { createdAt: -1 },
        },
        {
            $skip: (page - 1) * limit,
        },
        {
            $limit: limit
        }
    ])

    if(getalltheproductswiththiscategory.length===0){
        throw new apierror(404,"there are no products of this category")
    }

    return res.status(200).json(
        new apiresponse(200,getalltheproductswiththiscategory,"all the products fetched successfully")
    )
});

const toggleisactivecategory = asynchandler(async(req,res)=>{
    const {categoryId} = req.params;

    if(!categoryId){
        throw new apierror(400,"category is required");
    }

    const category = await Category.findById(categoryId);

    if(!category){
        throw new apierror(404,"category does not exist");
    }

    category.isactive = !category.isactive;

    await category.save();

    return res.status(200).json(
        new apiresponse(200,category,"isactive toggled successfully")
    )
});

const getdetailsofthecategorybycategoryid = asynchandler(async(req,res)=>{
    const {categoryId} = req.params;

    if(!categoryId){
        throw new apierror(400,"category id is required");
    }

    const category = await Category.findById(categoryId);

    if(!category){
        throw new apierror(404,"category does not exist");
    }

    return res.status(200).json(
        new apiresponse(200,category,"category fetched successfully")
    )
})

const getallactivecategories = asynchandler(async(req,res)=>{
    
    const categories = await Category.aggregate([
        {
            $match:{
                isactive:true,
            }
        }
    ])

    if(categories.length===0){
        throw new apierror(404,"there are no active categories");
    }

    return res.status(200).json(
        new apiresponse(200,categories,"all the active categories fetched successfully")
    );
})


const getallthecategories = asynchandler(async(req,res)=>{
    const category = await Category.find().sort({ createdAt: -1 }).lean();

    if(category.length===0){
        throw new apierror(404,"there does not exist any category");
    }


    return res.status(200).json(
        new apiresponse(200,category,"all the category fetched successfully")
    )
});



module.exports = {publishacategory
    ,getalltheproductswiththiscategory
    ,toggleisactivecategory
    ,getdetailsofthecategorybycategoryid
    ,getallactivecategories
    ,getallthecategories

};