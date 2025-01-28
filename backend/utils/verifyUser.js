const jwt = require('jsonwebtoken');
const verifyToken = (req,res,next)=>{
    try {
    const token = req.cookies.access_token;
    if(!token){
        return res.status(400).json({
            success: false,
            message: 'Unauthorized! No token provided'
        })
    }
    jwt.verify(token,process.env.JWT_SECRET,(err,user)=>{
        if(err){
            return res.status(400).json({
                success: false,
                message: 'Unauthorized'
            })
        }
        req.user = user;
        next();
    })
} catch(error){
    return res.status(500).json({
        success: false,
        message: error.message
    })
}

}

module.exports = {verifyToken}