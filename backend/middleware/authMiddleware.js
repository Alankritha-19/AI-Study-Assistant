import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect=async(req,res,next)=>{
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        try{
            token=req.headers.authorization.split(" ")[1];
            const secret = process.env.JWT_SECRET || process.env["JWT-SECRET"];
            if (!secret) {
                return res.status(500).json({message:"JWT secret is not configured"});
            }
            const decoded=jwt.verify(token,secret);
            req.user=await User.findById(decoded.id).select("-password");
            if(!req.user){
                return res.status(401).json({message:"User not found with this token"});
            }
            next();
        } catch (error) {
            console.error("JWT verification failed : ",error.message);
            return res.status(401).json({message:"Not authorized, token invalid or expired"});
        }
    }
    if(!token){
        return res.status(401).json({message:"Not authorized, no token provided"});
    }
};