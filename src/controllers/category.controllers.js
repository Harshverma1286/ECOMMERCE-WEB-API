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

const getsubcategories = asynchandler(async(req,res)=>{
    const {categoryId} = req.params;

    if(!categoryId){
        throw new apierror(400,"category id is required");
    }

    const parentcategory = await Category.findById(categoryId);

    if(!parentcategory){
        throw new apierror(404,"parent category is not there");
    }

    const subcategories = await Category.findById({parentcategory:categoryId});

    if(subcategories.length===0){
        throw new apierror(400,"there are no subcategories");
    }

    return res.status(200).json(
        new apiresponse(200,subcategories,"all the subcategories recived successfully")
    )
});

const publishasubcategory = asynchandler(async(req,res)=>{
    const {name,color,description,parentcategory} = req.body;

    if(!name?.trim()){
        throw new apierror(400,"name is required");
    }

    if(!color?.trim()){
        throw new apierror(400,"color is required");
    }

    if(!description?.trim()){
        throw new apierror(400,"description is required");
    }

    if(!parentcategory){
        throw new apierror(400,"parentcategory is required");
    }

    const parent = await Category.findById(parentcategory);

    if(!parent){
        throw new apierror(404,"parent does not exist");
    }

    const findname = await Category.findOne({name,parentcategory});

    if(findname){
        throw new apierror(400,"this sub category already exist");
    }


    const iconpath = req.files?.icon?.[0]?.path;

    if(!iconpath){
        throw new apierror(400,"icon path not found");
    }

    const uploadicon = await uploadoncloudinary(iconpath);

    if(!uploadicon){
        throw new apierror(500,"something went wrong while uploading icon");
    }

    const bannerpath = req.files?.banner?.[0]?.path;

    const uploadingbanner = bannerpath ? await uploadoncloudinary(bannerpath) : null;

    const createsubcategory = await Category.create({
        name,
        color,
        description,
        icon:uploadicon.url,
        bannerimage:uploadingbanner?.url|| "",
        parentcategory:parentcategory,
    })

    if(!createsubcategory){
        throw new apierror(500,"something went wrong while creating it");
    }

    return res.status(200).json(
        new apiresponse(200,createsubcategory,"sub category created successfully")
    )
});

const getparentcategorybythesubcategory = asynchandler(async(req,res)=>{
    const {categoryId} = req.params;

    if(!categoryId){
        throw new apierror(400,"category id is required");
    }

    const category = await Category.findById(categoryId);

    if(!category){
        throw new apierror(404,"this category does not exist");
    }

    if(!category.parentcategory){
        throw new apierror(404,"there are no subcategories");
    }

    const subcategory = await Category.findOne(category.parentcategory);

    if(!subcategory){
        throw new apierror(404,"there are no subcategories");
    }

    return res.status(200).json(
        new apiresponse(200,subcategory,"all the subcategories fetched successfully")
    )
});



module.exports = {publishacategory
    ,getalltheproductswiththiscategory
    ,toggleisactivecategory
    ,getdetailsofthecategorybycategoryid
    ,getallactivecategories
    ,getallthecategories
    ,getsubcategories
    ,publishasubcategory
    ,getparentcategorybythesubcategory
};