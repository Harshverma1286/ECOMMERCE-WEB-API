const mongoose = require('mongoose');

const asynchandler = require('../utils/asynchandler');

const apierror = require("../utils/apierror");

const apiresponse = require('../utils/apiresponse');

const User = require("../models/users.models");

const jwt = require('jsonwebtoken');

const {uploadoncloudinary,deletefromcloudinary} = require("../utils/cloudinary");
const { use } = require('react');
const { stat } = require('fs');

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

const updateusernameemailandfullname = asynchandler(async(req,res)=>{
    const {username,email,fullname} = req.body;

    const updatefields = {};

    if(username){
        const existingUser = await User.findOne({ username });
        if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
            throw new apierror(400, "Username already in use");
        }
        updatefields.username = username.trim().toLowerCase()
    };
    if(email) updatefields.email = email.trim().toLowerCase();
    if(fullname) updatefields.fullname = fullname.trim().toLowerCase();

    if(Object.keys(updatefields).length==0){
        throw new apierror(400,"kindly provide any respective field to update");
    }

    // if(updatefields.username){
    //     const updateusername = await User.findByIdAndUpdate(
    //         req.user._id,
    //         {
    //             $set:{
    //                 username:updatefields.username.trim().toLowerCase(),
    //             }
    //         },
    //         {new:true}
    //     );

    //     if(!updateusername){
    //         throw new apierror(500,"something went wrong while updating username");
    //     }
    // }

    // if(updatefields.email){
    //     const updateemail = await User.findByIdAndUpdate(
    //         req.user._id,
    //         {
    //             $set:{
    //                 email:updatefields.email.trim().toLowerCase(),
    //             }
    //         },
    //         {new:true}
    //     );

    //     if(!updateemail){
    //         throw new apierror(400,"something went wrong while updating email");
    //     }
    // }

    // if(updatefields.fullname){
    //     const updatefullname = await User.findByIdAndUpdate(
    //         req.user._id,
    //         {
    //             $set:{
    //                 fullname:updatefields.fullname.trim(),
    //             }
    //         }
    //     )

    //     if(!updatefullname){
    //         throw new apierror(400,"something went wrong while updating full name");
    //     }
    // }

        const updatedUser = await User.findByIdAndUpdate(
                req.user._id,
                { $set: updatefields },
                { new: true, runValidators: true }
            ).select("-password -refreshtoken");

        if (!updatedUser) {
            throw new apierror(500, "Something went wrong while updating user");
        }

        return res.status(200).json(
            new apiresponse(200, updatedUser, "Profile updated successfully")
        );

});

const updatepassword = asynchandler(async(req,res)=>{
    const {newpassword,oldpassword} = req.body;

    if(!newpassword){
        throw new apierror(400,"kindly provide new password to update");
    }

    if(!oldpassword){
        throw new apierror(400,"kindly provide the old passowrd");
    }

    if(newpassword===oldpassword){
        throw new apierror(400,"plz provide differnt password");
    }

    const user = await User.findById(req.user._id);

    const checkpassword = await user.ispasswordcorrect(oldpassword);

    if(!checkpassword){
        throw new apierror(400,"password incorrect");
    }

    user.password = newpassword;

    await user.save();

    return res.status(200).json(
        new apiresponse(200,{},"password updated successfully")
    )
    
});

const updateavatar = asynchandler(async(req,res)=>{
    const avatarpath = req.file?.path;

    if(!avatarpath){
        throw new apierror(400,"kindly provide the avatar");
    }

    const user = await User.findById(req.user._id);

    const oldavatar = user.avatar;

    if(oldavatar){
        const public_id = getPublicIdFromUrl(oldavatar);
        await deletefromcloudinary(public_id);
    }
    const updateoncld = await uploadoncloudinary(avatarpath);

    if(!updateoncld?.url){
        throw new apierror(500,"cloudinary upload failed");
    }

    const updatetheavatar = await User.findByIdAndUpdate(
        user._id,
        {
            $set:{
                avatar:updateoncld.url,
            }
        },
        {new:true},
    );

    if(!updatetheavatar){
        throw new apierror(500,"something went wrong while updating");
    }

    return res.status(200).json(
        new apiresponse(200,updatetheavatar?.url,"avatar updated successfully")
    )


});

const addanewadress = asynchandler(async(req,res)=>{
    const {line1,line2,city,state,country,zip,isdefault} = req.body;

    if(!line1 || !line2 || !city || !state || !country || !zip){
        throw new apierror(400,"all the fields are required");
    }


    const user = await User.findById(req.user._id);

    if(!user){
        throw new apierror(400,"user not found");
    }

    if(isdefault){
        user.address.forEach(
            (addr)=>
                addr.isdefault = false
    );
    }


    user.address.push({
        line1,
        line2,
        city,
        state,
        zip,
        country,
        type:"other",
        isdefault: !!isdefault, 
    });

    await user.save();


    return res.status(200).json(
        new apiresponse(200,user.address,"address created and added successfully")
    )



});

const deleteanaddress = asynchandler(async(req,res)=>{
    const {addressId} = req.params;

    if(!addressId){
        throw new apierror(400,"need addressid to delete");
    }

    const user = await User.findById(req.user._id);

    const addresstodelete = user.address.find(addr => addr.id.toString()===addressId);


    if(!addresstodelete){
        throw new apierror(401,"address not found");
    }

    if(addresstodelete.isdefault){
        throw new apierror(400,"cannot delete the address because it is set as default");
    }



    user.address = user.address.filter(addr=> addr.id.toString()!==addressId);

    await user.save();

    return res.status(200).json(new apiresponse(200,user.address,"user address fetched successfully"));

});


const getuserprofile = asynchandler(async(req,res)=>{
    const user = await User.findById(req.user._id).select("-password -refreshtoken");

    if(!user){
        throw new apierror(400,"user not found");
    }

    return res.status(200).json(
        new apiresponse(200,user,"user fetched successfully")
    )

});

const updateaddress = asynchandler(async(req,res)=>{
    const {addressId} = req.params;

    if(!addressId){
        throw new apierror(400,"kindly provide the address id");
    }

   const {line1,line2,city,state,country,zip} = req.body;

   const updatefields = {};

   if(line1){
    updatefields["address.$.line1"] = line1.trim();
   }
    if (line2) updatefields["address.$.line2"] = line2.trim();


    if (city) updatefields["address.$.city"] = city.trim();

    if (state) updatefields["address.$.state"] = state.trim();

    if (country) updatefields["address.$.country"] = country.trim();

    if (zip) updatefields["address.$.zip"] = zip.trim();

   if(Object.keys(updatefields).length==0){
    throw new apierror(400,"kindly provide any of the respective fields to update it");
   }

   const updation = await User.findOneAndUpdate(
    {
        _id:req.user._id,
        "address._id":addressId,
    },
    {
        $set:updatefields
    },
    {new:true}
   ).select("-password -refreshtoken");


   if(!updation){
    throw new apierror(400,"something went wrong while updating the address");
   }

   return res.status(200).json(
    new apiresponse(200,updation,"address updated successfully")
   )
});
module.exports = {registeruser,loginuser,logoutuser,generateaccesstoken,updateusernameemailandfullname,updatepassword,updateavatar,addanewadress,deleteanaddress,getuserprofile,updateaddress};