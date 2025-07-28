const mongoose = require('mongoose');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userschema = mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
            lowercase:true,
            trim:true,
            index:true,
            unique:true,
        },
        email:{
            type:String,
            required:true,
            lowercase:true,
            unique:true,
            trim:true,
            index:true,
        },
        fullname:{
            type:String,
            required:true,
            trim:true,
            index:true,
        },
        password:{
            type:String,
            required:true,
        },
        address:[
            {
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
                    trim:true,
                },
                state:{
                    type:String,
                    required:true,
                    trim:true,
                },
                zip:{
                    type:String,
                    required:true,
                    trim:true,
                },
                country:{
                    type:String,
                    required:true,
                    trim:true,
                },
                type:{
                    type:String,
                    enum:['home','work','other'],
                    default:'home'
                },
                isdefault:{
                    type:Boolean,
                    default:false
                }
            }
        ],
        phone:{
            type:String,
            required:true,
            trim:true,
        },
        isadmin:{
            type:Boolean,
            default:false,
        },
        isverified:{
            type:Boolean,
            default:false,
        },
        avatar:{
            type:String,
            required:true,
        }
    },
    {
        timestamps:true,
    }
);

userschema.pre('save',async function(req,res,next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password,10);
    next();
});

userschema.methods.ispasswordcorrect = async function(password){
    return await bcrypt.compare(password,this.password);
}

userschema.methods.generateaccesstoken = async function(){
    return jwt.sign(
        {
            _id:this.id,
            email:this.email,
            name:this.name,
            fullname:this.fullname,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn:process.env.AEXPIRES_IN},
    );
};

userschema.methods.generaterefreshtoken = async function(){
    return jwt.sign(
        {
            _id:this.id,
        },
        process.env.REFRESH_TOKEN,
        {expiresIn:process.env.REXPIRES_IN},
    )
}

module.exports = mongoose.model("user",userschema);