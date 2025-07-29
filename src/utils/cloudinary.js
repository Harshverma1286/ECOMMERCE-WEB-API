const cloudinary = require('cloudinary').v2;

const fs = require('fs');

console.log("🔐 Cloudinary ENV Check:", process.env.CLOUDINARY_CLOUD_NAME);


cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
});


const uploadoncloudinary = async(localfilepath)=>{
    try {
        if(!localfilepath) return null;
        const response = await cloudinary.uploader.upload(localfilepath,{
            resource_type:"auto"
        })
        fs.unlinkSync(localfilepath);
        return response;
    } catch (error) {
        console.log("cloudinary upload error:",error.message);
        fs.unlinkSync(localfilepath);
        return null;
    }
}

const deletefromcloudinary = async(publicId,type="image")=>{
    try {
        if(!publicId) return null;
        await cloudinary.uploader.destroy(publicId,{
            resource_type:type,
        })
    } catch (error) {
        console.log("cloudinary delete error:",error.message);
    }
}

module.exports = {uploadoncloudinary,deletefromcloudinary};