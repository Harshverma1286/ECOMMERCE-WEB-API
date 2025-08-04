const mongoose = require('mongoose');

const asynchandler = require("../utils/asynchandler");

const apierror = require("../utils/apierror");

const apiresponse = require("../utils/apierror");

const Product = require("../models/products.models");

const {uploadoncloudinary,deletefromcloudinary} = require("../utils/cloudinary");

const Category = require("../models/category.models");

const getPublicIdFromUrl = (url) => {
    try {
        const parts = url.split("/");

        const fileWithExt = parts[parts.length - 1];

        const fileName = fileWithExt.split(".")[0];

        const folder = parts[parts.length - 2];

        return `${folder}/${fileName}`;
    } catch (error) {
        console.error("Failed to extract public_id from URL:", error);
        return null;
    }
};



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

    const createproduct = await Product.create({
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

const updateproductprice = asynchandler(async(req,res)=>{
    const {productId} = req.params;

    if(!productId){
        throw new apierror(400,"product id is required");
    }

    const product = await Product.findById(productId);


    if(!product){
        throw new apierror(404,"product does not exist");
    }

    if(product.owner.toString()!==req.user._id.toString()  && !req.user.isadmin){
        throw new apierror(403,"you dont have the access to change the product price");
    }

    const {price} = req.body;

    if(price===undefined || price<0){
        throw new apierror(400,"plz enter the price and it should be more than zero");
    }

    product.price = price;

    await product.save();

    return res.status(200).json(
        new apiresponse(200,product.price,"product price has changed successfully and will reflect accordingly")
    )
});

const updatethecountinstockofproduct = asynchandler(async(req,res)=>{
    const {productId} = req.params;

    if(!productId){
        throw new apierror(400,"product id is required");
    }

    const product = await Product.findById(productId);

    if(!product){
        throw new apierror(404,"product does not exist");
    }

    if(product.owner.toString()!==req.user._id.toString() &&  !req.user.isadmin){
        throw new apierror(403,"you are not granted the access to update it");
    }

    const {countinstock} = req.body;

    if(countinstock===undefined || countinstock<0){
        throw new apierror(400,"kindly provide me the countinstock and it should be greater than zero");
    }

    product.countinstock = countinstock;

    await product.save();

    return res.status(200).json(
        new apiresponse(200,product,"count in stock updated successfully")
    )

});

const updatethenamedescriptionandrichdescriptionoftheproduct = asynchandler(async(req,res)=>{
    const {productId} = req.params;

    if(!productId){
        throw new apierror(400,"product id is required");
    }

    const product = await Product.findById(productId);

    if(!product){
        throw new apierror(404,"product does not found");
    }

    if(product.owner.toString()!==req.user._id.toString() && !req.user.isadmin){
        throw new apierror(403,"you dont have access to it");
    }

    const {name,description,richdescription} = req.body;

    const updatefields = {};

    if(name){
        updatefields.name = name.trim();
    }

    if(description){
        updatefields.description = description.trim();
    }

    if(richdescription){
        updatefields.richdescription = richdescription.trim();
    }

    if(Object.keys(updatefields).length==0){
        throw new apierror(400,"kindly provide me something to update");
    }

    const productupdate = await Product.findByIdAndUpdate(
        productId,
        {$set:updatefields},
        {new:true},
    )

    if(!productupdate){
        throw new apierror(500,"something went wrong while updating the product");
    }

    return res.status(200).json(
        new apiresponse(200,productupdate,"product updated successfullly")
    )

})

const updatethemainimageoftheproduct = asynchandler(async(req,res)=>{
    const {productId} = req.params;

    if(!productId){
        throw new apierror(400,"product id not recived");
    }

    const product = await Product.findById(productId);

    if(!product){
        throw new apierror(404,"product not found");
    }

    if(product.owner.toString()!==req.user._id.toString() && !req.user.isadmin){
        throw new apierror(403,"you dont have access to update it");
    }

    const imagepath = req.file?.path;

    if(!imagepath){
        throw new apierror(400,"image path is required");
    }

    const oldimage = product.image;

    if(oldimage){
        const public_id = getPublicIdFromUrl(oldimage);
        await deletefromcloudinary(public_id);
    }

    const uploadimage = await uploadoncloudinary(imagepath);

    if(!uploadimage){
        throw new apierror(500,"image cant be uploaded something went wrong");
    }

    product.image = uploadimage.url;

    await product.save();

    return res.status(200).json(
        new apiresponse(200, product,"product main image updated successfuly")
    )


});

const updateisfeaturedoftheproduct = asynchandler(async(req,res)=>{
    const {productId} = req.params;

    if(!productId){
        throw new apierror(400,"product id is required");
    }

    const product = await Product.findById(productId);


    if(!product){
        throw new apierror(404,"product not found");
    }


    if(product.owner.toString()!==req.user._id.toString() && !req.user.isadmin){
        throw new apierror(403,"access not granted");
    }

    product.isfeatured = !product.isfeatured;

    await product.save({ validateBeforeSave: false });

    return res.status(200).json(
        new apiresponse(200,product,"isfeatured updated successfully")
    )
});




module.exports = {publishaproduct,updateproductprice,updatethecountinstockofproduct,updatethenamedescriptionandrichdescriptionoftheproduct,updatethemainimageoftheproduct,updateisfeaturedoftheproduct};