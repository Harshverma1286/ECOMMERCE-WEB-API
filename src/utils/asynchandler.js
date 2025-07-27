const asynchandler = (fn) => async(req,res,next)=>{
    try {
        await fn(req,res,next);
    } catch (error) {
        console.log("err",error);
        res.status(error.code || 500).json({
            success:false,
            message:err.message,
        })
    }
}

module.exports = asynchandler;