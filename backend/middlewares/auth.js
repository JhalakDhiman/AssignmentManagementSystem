import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config();

export const auth = async (req,res, next) => {

    try {
        
        const token = req?.body?.token || req?.cookies?.token || req?.get("Authorization")?.replace("Bearer ", "");
        console.log("token : ",token);
        if(!token) {
            return res.status(401).json({
                success:false,
                message:'TOken is missing',
            });
        }
        try {
            const payload = jwt.verify(token,process.env.JWT_SECRET);
            console.log("payload: ",payload);
            req.user = payload || payload.user;
        } catch (error) {
            return res.status(401).json({
                success:false,
                message:"Invaild token."
            })
        } 
        next();
    } catch (error) {
        console.log(error)
        return res.status(401).json({
            success:false,
            message:"Error in validating token"
        })
    }
}

export const isStudent = async(req,res,next) =>{
    try{
        console.log("Going to check protected route of student");
        if(req.user.accountType !== "Student"){
            return res.status(401).json({
                success:false,
                message:"This is a protected route for students only",
            })
        }
        console.log("check success")
        next();
    }   catch(error){
        return res.status(500).json({
            success:false,
            message:"User role cannot be verified,please try again"
        })
    }
}

export const isProfessor = async(req,res,next) =>{
    try{
        if(req.user.accountType !== 'Professor'){
            return res.status(401).json({
                success:false,
                message:"This is a protected route for Professors only",
            })
        }
        next();
    }   catch(error){

        
        return res.status(500).json({
            success:false,
            message:"User role cannot be verified,please try again"
        })
    }
}



