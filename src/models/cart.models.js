const mongoose = require('mongoose');

const cartitemschema = mongoose.Schema(
    {
        product:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'product',
        },
        quantity:{
            type:Number,
            required:true,
            default:1,
            min:1,
        },
        variant:{
            color:{
                type:String,
            },
            size:{
                type:String,
            }
        }
    },
    {_id:false}
);

const cartschema = mongoose.Schema(
    {
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'user',
            required:true,
            unique:true,
        },
        items:[cartitemschema],
    },
    {
        timestamps:true,
    }
)

module.exports = mongoose.model("cart",cartschema);