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

    const categorycheck = await Category.findById(category);

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

    const uploadit = await uploadoncloudinary(imagepath);

    if(!uploadit?.url){
        throw new apierror(400,"something went wrong while uploading");
    }

    const uploaddextra = extraimages? await Promise.all(extraimages.map(img=> uploadoncloudinary(img))):[];

    if (extraimages && uploaddextra.some(img => !img?.url)) {
        throw new apierror(500, "Some extra images failed to upload");
    }

    if (!Array.isArray(variants) || variants.length === 0) {
        throw new apierror(400, "At least one variant is required");
    }

    for (const [index, vari] of variants.entries()) {
        const fieldsinariants = ["color", "size"];
        const numberinvariants = ["stock", "price"];

        for (let field of fieldsinariants) {
            if (!vari[field] || typeof vari[field] !== "string") {
                throw new apierror(400, `Variant at index ${index} has invalid or missing ${field}`);
            }
        }

        for (let numField of numberinvariants) {
            if (vari[numField] === undefined || typeof vari[numField] !== "number" || isNaN(vari[numField])) {
                throw new apierror(400, `Variant at index ${index} has invalid or missing ${numField}`);
            }
        }
    }

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

    product.price=price;

    await product.save();

    const actualprice = product.getactualprice(price,product.discount);

    return res.status(200).json(
        new apiresponse(200,{actualprice,product},"product price has changed successfully and will reflect accordingly")
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

const toggleisactiveoftheproduct = asynchandler(async(req,res)=>{
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

    product.isactive = !product.isactive;

    await product.save({validateBeforeSave:false});

    return res.status(200).json(
        new apiresponse(200,product,"isactive toggled successfully")
    )
})

const uploadmoreimages = asynchandler(async(req,res)=>{
    const {productId} = req.params;

    if(!productId){
        throw new apierror(400,"product id not recived");
    }

    const product = await Product.findbyId(productId);

    if(!product){
        throw new apierror(404,"product not found");
    }

    if(product.owner.toString()!==req.user._id.toString() && !req.user.isadmin){
        throw new apierror(403,"you dont have access");
    }

    const extraimages = req.files?.images;

     if(!extraimages || extraimages.length==0){
        throw new apierror(400,"we want images to update");
     }

    let uploaded;
    try {
        uploaded = await Promise.all(
        extraimages.map((file) => uploadoncloudinary(file.path))
        );
    } catch (err) {
        throw new apierror(500, "One or more image uploads failed");
    }

    const urls = uploaded.map((u)=>{
        if(!u?.url){
            throw new apierror(500,"url not found");
        }
        return u.url;
    })

    product.images.push(...urls);

    await product.save();

    return res.status(200).json(
        new apiresponse(200,product,"more images uploaded successfully")
    )

})

const deleteimages = asynchandler(async(req,res)=>{
    const {productId,imagesId} = req.params;

    if(!productId){
        throw new apierror(400,"product id is required");
    }

    const product = await Product.findById(productId);

    if(!product){
        throw new apierror(404,"product not found");
    }

    if(!imagesId){
        throw new apierror(400,"image id is required");
    }


    if(product.owner.toString()!==req.user._id.toString() && !req.user.isadmin){
        throw new apierror(403,"you dont have access to it");
    }


    const findimage = product.images.find(prod=> prod._id.toString()===imagesId);

    if(!findimage){
        throw new apierror(404,"image not foun d which u want to delete");
    }

    const oldimage = findimage.url;

    if(oldimage){
        const public_id = getPublicIdFromUrl(oldimage);

        await deletefromcloudinary(public_id);
    }

    product.images = product.images.filter(prod=> prod._id.toString()!==imagesId);

    await product.save();

    return res.status(200).json(
        new apiresponse(200,product,"product image deleted successfully")
    )


});

const adddiscountintheproduct = asynchandler(async(req,res)=>{
    const {productId} = req.params;

    if(!productId){
        throw new apierror(400,"product id is required");
    }

    const product = await Product.findById(productId);

    if(!product){
        throw new apierror(404,"product not found");
    }

    if(product.owner.toString()!==req.user._id.toString() && !req.user.isadmin){
        throw new apierror(403,"you dont have the access to add the discount");
    }

    const {discount} = req.body;

    if(discount==null && isNaN(discount) && discount<0 && discount>100){
        throw new apierror(400,"plz add the correct discount number");
    }

    product.discount = discount;

    await product.save();

    const actualprice = product.getactualprice(product.price,discount);

    return res.status(200).json(
        new apiresponse(200,{actualprice,product},"discount added sucessfully")
    )

});

const gettheproductdetail = asynchandler(async(req,res)=>{
    const{productId} = req.params;

    if(!productId){
        throw new apierror(400,"product id is required");
    }

    const product = await Product.findById(productId);

    if(!product){
        throw new apierror(404,"product not found");
    }

    return res.status(200).json(
        new apiresponse(200,product,"product details fetched successfully")
    )
});

const getsalesoftheproduct = asynchandler(async(req,res)=>{
    const {productId} = req.params;

    if(!productId){
        throw new apierror(400,"product not found");
    }

    const product = await Product.findById(productId);

    if(!product){
        throw new apierror(404,"product not found");
    }

    if(product.owner.toString()!==req.user._id.toString() && !req.user.isadmin){
        throw new apierror(403,"you dont have access to it");
    }

    return res.status(200).json(
        new apiresponse(200,{salescount:product.salescount},"sales count fetched successfully")
    )
})


const addmorevariantsoftheproduct = asynchandler(async(req,res)=>{
   const {productId} = req.params;
   
   if(!productId){
    throw new apierror(400,"product id not found");
   }

   const product = await Product.findById(productId);

   if(!product){
    throw new apierror(404,"product not found");
   }

   if(product.owner.toString()!==req.user._id.toString() && !req.user.isadmin){
    throw new apierror(400,"you dont have access to it");
   }

   const {color,size,stock,price} = req.body;

   if(!color){
    throw new apierror(400,"color is required");
   }


   if(!size){
    throw new apierror(400,"size is required");
   }

   if(stock===undefined || isNaN(stock) || stock<0){
    throw new apierror(400,"stock is required");
   }
   if(price===undefined || isNaN(price) || price<0){
    throw new apierror(400,"price is required");
   }

   const existingvariant = product.variants.find((v)=>v.color===color && v.size===size);

   if(existingvariant){
    throw new apierror(400,"variants already exist");
   }

   product.variants.push({
    color,
    size,
    stock,
    price,
   });

   await product.save();

   return res.status(200).json(
    new apiresponse(200,product,"variants added successfully")
   )

   
});

const deleteavariantintheproduct = asynchandler(async(req,res)=>{
    const {productId,variantid} = req.params;

    if(!productId){
        throw new apierror(400,"product id is required");
    }

    const product = await Product.findById(productId);

    if(!product){
        throw new apierror(404,"product not found");
    }

    if(!variantid){
        throw new apierror(400,"variant id is required");
    }

    const findvariant = product.variants.find((vari)=> vari._id.toString()===variantid);

    if(!findvariant){
        throw new apierror(404,"variant does not exist");
    }

    product.variants.filter((vari)=>vari._id.toString()!==variantid);

    await product.save();

    return res.status(200).json(
        new apiresponse(200,product,"variant removed successfully")
    )
});

const getactiveproductsoftheuser = asynchandler(async(req,res)=>{
    const {userid} = req.params;

    if(!userid){
        throw new apierror(400,"user id not recived");
    }

    const activeprosuctsoftheuser = await Product.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(userid),
                isactive:true
            }
        }
    ]);

    if(activeprosuctsoftheuser.length==0){
        throw new apierror(400,"there are no products of the user that is active");
    }

    return res.status(200).json(
        new apiresponse(200,activeprosuctsoftheuser,"all active products of the user fetched successfully")
    )
});

const getalltheproductsoftheuser = asynchandler(async(req,res)=>{
    const {userid} = req.params;

    if(!userid){
        throw new apierror(400,"user id is required");
    }

    const alltheproductsoftheuser = await Product.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(userid)
            }
        },
        {
            $lookup:{
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "ownerDetails"
            }
        },
        {
            $unwind: { path: "$ownerDetails", preserveNullAndEmptyArrays: false }
        }
    ]);

    if(alltheproductsoftheuser.length==0){
        throw new apierror(400,"there are no products of the user");
    }

    return res.status(200).json(
        new apiresponse(200,alltheproductsoftheuser,"all products of the user fetched successfully")
    )
});



module.exports = {publishaproduct,updateproductprice,updatethecountinstockofproduct,updatethenamedescriptionandrichdescriptionoftheproduct,updatethemainimageoftheproduct,updateisfeaturedoftheproduct,toggleisactiveoftheproduct,uploadmoreimages,deleteimages,adddiscountintheproduct,gettheproductdetail,getsalesoftheproduct,addmorevariantsoftheproduct,deleteavariantintheproduct,getactiveproductsoftheuser,getalltheproductsoftheuser};