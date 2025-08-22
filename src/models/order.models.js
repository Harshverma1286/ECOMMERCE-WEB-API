const mongoose = require('mongoose');

const orderschema = mongoose.Schema(
    {
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"user",
            required:true,
        },
        orderitems:[
            {
                product:{
                    type:mongoose.Schema.Types.ObjectId,
                    ref:"product",
                    required:true,
                },
                quantity:{
                    type:Number,
                    required:true,
                    min:1,
                },
                priceatpackage:{
                    type:Number,
                    required:true,
                }
            }
        ],
        shippinginfo:{
            line1:{
                type:String,
                required:true,
                trim:true,
            },
            line2:{
                type:String,
                required:true,
                trim:true,
            },
            city:{
                type:String,
                required:true,
            },
            state:{
                type:String,
                required:true,
            },
            zip:{
                type:String,
                required:true,
            },
            phone:{
                type:String,
                required:true,
            },
            country:{
                type:String,
                required:true,
                trim:true
            }
        },
        totalamount:{
            type:Number,
            required:true,
        },
        orderstatus:{
            type:String,
            enum:["processing","shipped","delivered","cancelled"],
            default:"processing",
        },
        deliveredat:{
            type:Date,
        },
        comment:{
            type:String,
        }
    },
    {timestamps:true},
)

orderschema.methods.getfullprice = async function(orderitems){
    let ans = 0;
    orderitems.forEach((orders)=>{
        ans = ans + (orders.quantity*orders.priceatpackage);
    })
    return ans;
}

module.exports = mongoose.model('order',orderschema);