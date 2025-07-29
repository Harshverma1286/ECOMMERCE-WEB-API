const mongoose = require('mongoose');

const asynchandler = require('../utils/asynchandler');

const apierror = require("../utils/apierror");

const apiresponse = require('../utils/apiresponse');

const User = require("../models/users.models");

const uploadoncloudinary = require("../utils/cloudinary");
const { use } = require('react');

const registeruser = asynchandler(async(req,res)=>{
    const {username,email,fullname,password,phone,address} = req.body;

    if(!username){
        throw new apierror(400,"username is required");
    }

    if(!email){
        throw new apierror(400,"email is required");
    }
    if(!fullname){
        throw new apierror(400,"fullname is required");
    }

    if(!phone){
        throw new apierror(400,"phone number is required");
    }

    if(!Array.isArray(address) || address.length==0){
        throw new apierror(400,"atleast one address is required");
    }

    const addr=address[0];

    const requiredfields = ["line1","line2","city","state","zip","country"];

    for(const fields of requiredfields){
        if(!addr[fields] || typeof addr[fields]!=="string" || addr[fields].trim()===""){
            throw new apierror(400,`The following address field  ${fields} is missing`);
        }
    }

    const checkthroughusername = await User.findOne({username});

    if(checkthroughusername){
        throw new apierror(400,"user already exist");
    }

    const checkthroughemail = await User.findOne({email});

    if(checkthroughemail){
        throw new apierror(400,"user already exist");
    }

    const checkthroughphonenumber = await User.findOne({phone});

    if(checkthroughphonenumber){
        throw new apierror(400,"phone number already exist");
    }

     const avatarPath = req.file?.path;

     if(!avatarPath){
        throw new apierror(400,"avatar path is required");
     }

     const avatar = await uploadoncloudinary(avatarPath);

     if(!avatar){
        throw new apierror(500,"something went wrong while uploading it");
     }

     const user = await User.create({
        username:username.toLowerCase(),
        email:email.toLowerCase(),
        fullname,
        password,
        address,
        avatar:avatar?.url,
        phone,
     });

     const createduser = await User.findById(user._id).select(
        "-password"
     )

     if(!createduser){
        throw new apierror(500,"something went wrong");
     }

     return res.status(200).json(
        new apiresponse(200,createduser,"user created successfully")
     );
})


module.exports = {registeruser};