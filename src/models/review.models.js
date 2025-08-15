const mongoose = require('mongoose');


const reviewSchema = mongoose.Schema(
    {
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'user',
        },
        product:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'product',
        },
        comment:{
            type:String,
            trim:true,
        },
        rating:{
            type:Number,
            required:true,
            min:0,
            max:5
        },
    },
    {timestamps:true}
);

module.exports = mongoose.model("review",reviewSchema);