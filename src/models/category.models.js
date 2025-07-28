const mongoose = require('mongoose');

const categorySchema = mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
            trim:true,
        },
        color:{
            type:String,
            required:true,
        },
        icon:{
            type:String,
            required:true,
        },
        description:{
            type:String,
            required:true,
            trim:true,
        },
        isactive:{
            type:Boolean,
            default:true,
        },
        bannerimage:{
            type:String,
            default:'',
        },
        parentcategory:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'category',
            default:null,
        }
    },
    {timestamps:true},
);

module.exports = mongoose.model("category",categorySchema);