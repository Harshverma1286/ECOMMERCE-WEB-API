const mongoose = require('mongoose');

const asynchandler = require('../utils/asynchandler');

const apierror = require("../utils/apierror");

const apiresponse = require('../utils/apiresponse');

const User = require("../models/users.models");

const jwt = require('jsonwebtoken');

const uploadoncloudinary = require("../utils/cloudinary");
const { use } = require('react');

const generateaccessandrefreshtoken = async(userid)=>{
    try {
        if(!userid){
            throw new apierror(400,"userid is required");
        }
    
        const user = await User.findById(userid);
    
        if(!user){
            throw new apierror(400,"user does not exist");
        }
    
    
    
        const accesstoken = await user.generateaccesstoken();
    
        const refreshtoken = await user.generaterefreshtoken();
    
        user.refreshtoken = refreshtoken;
    
        await user.save({ validateBeforeSave: false });
    
        return {accesstoken,refreshtoken};
    } catch (error) {
        throw new apierror(500,error.message || "something wentwrong while generating accesstoken and refreshtoken");
    }
}

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
});

const loginuser = asynchandler(async(req,res)=>{
    const{email,password} = req.body;

    if(!email){
        throw new apierror(400,"email is required ");
    }

    if(!password){
        throw new apierror(400,"password is required");
    }

    const user = await User.findOne({email});

    if(!user){
        throw new apierror(400,"account does not exist !");
    }

    const ispassword = await user.ispasswordcorrect(password);

    if(!ispassword){
        throw new apierror(400,"invalid email or password");
    }

    const {accesstoken,refreshtoken} = await generateaccessandrefreshtoken(user._id);

    if(!accesstoken){
        throw new apierror(500,"accesstoken was not generated");
    }

    if(!refreshtoken){
        throw new apierror(500,"refreshtoken was not generated");
    }

    const userfind = await User.findById(user._id).select("-password -refreshtoken");

    const options = {
    httpOnly: true,
    secure: true,
    sameSite: "strict", 
};

    return res.status(200)
    .cookie("accesstoken",accesstoken,options)
    .cookie("refreshtoken",refreshtoken,options)
    .json(
        new apiresponse(200,{user:userfind,refreshtoken,accesstoken},"user logged in successfully")
    );
    
});

const logoutuser = asynchandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshtoken:1
            }
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res.status(200).
    clearCookie("accesstoken",options)
    .clearCookie("refreshtoken",options).json(
        new apiresponse(200,{},"user logged out successfully")
    )
});

const generateaccesstoken = asynchandler(async(req,res)=>{
    const incomingrefreshtoken = req.cookies.refreshtoken || req.body.refreshtoken;

    if(!incomingrefreshtoken){
        throw new apierror(400,"refresh token not recieved");
    }

    try {
        const decodetoken = jwt.verify(incomingrefreshtoken,process.env.REFRESH_TOKEN_SECRET);

        if(!decodetoken){
            throw new apierror(500,"internal error");
        }

        const user = await User.findById(decodetoken._id);

        if(!user){
            throw new apierror(400,"user not found");
        }

        if(incomingrefreshtoken!==user.refreshtoken){
            throw new apierror(401,"access denied");
        }

        const {accesstoken,newrefreshtoken} = await generateaccessandrefreshtoken(user._id);

        if(!accesstoken){
            throw new apierror(500,"something went wrong while generating accesstoken");
        }

        if(!newrefreshtoken){
            throw new apierror(500,"something went wrong while generating refresh token");
        }

        const options = {
            httpOnly: true,
            secure:true
        }

        return res.status(200)
        .cookie("accesstoken",accesstoken,options)
        .cookie("refreshtoken",newrefreshtoken,options)
        .json(new apiresponse(200,{accesstoken,refreshtoken:newrefreshtoken},"acceess token refreshed successfully"));
    } catch (error) {
        throw new apierror(500,"something went wrong while generating access and refresh token");
    }
});


module.exports = {registeruser,loginuser,logoutuser,generateaccesstoken};