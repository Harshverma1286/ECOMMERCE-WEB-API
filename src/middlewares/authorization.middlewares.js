const express = require('express');

const mongoose = require('mongoose');

const jwt = require('jsonwebtoken');

const User = require("../models/users.models");

const asynchandler = require("../utils/asynchandler");

const apierror = require("../utils/apierror");


const authorization = asynchandler(async(req,res,next)=>{
    try {
        const token = req.cookies?.accesstoken || req.header("Authorization")?.replace("Bearer ","");

        console.log(token);

        if(!token || typeof token!=="string"){
            throw new apierror(401,"accesstoken  is missing");
        }

        const decodetoken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);

        const actualuser = await User.findById(decodetoken?._id).select("-password -refreshtoken");

        if(!actualuser){
            throw new apierror(400,"invalid access token");
        }

        req.user = actualuser;
        next();
    } catch (error) {
        throw new apierror(500,error.message ||"something went wrong");
    }
})


module.exports = authorization;