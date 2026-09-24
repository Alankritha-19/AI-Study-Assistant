import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const getJwtSecret = () => process.env.JWT_SECRET || process.env["JWT-SECRET"];

const generateToken=(id)=>{
    const secret = getJwtSecret();
    if (!secret) {
        throw new Error("JWT_SECRET is not configured");
    }
    return jwt.sign({id},secret,{expiresIn:"7d"});
};

export const registerUser=async(req,res)=>{
    try{
        const {name,email,password}=req.body;
        if(!name||!email||!password){
            return res.status(400).json({message:"Please provide all required fields"});
        }
        if(password.length<6){
            return res.status(400).json({message:"Password must be at least 6 characters long"});
        }
        const userExists=await User.findOne({email});
        if(userExists){
            return res.status(400).json({message:"User already exists with this email"});
        }
        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password,salt);

        const user=await User.create({
            name,
            email,
            password:hashedPassword
        });
        res.status(201).json({
            _id:user._id,
            name:user.name,
            email:user.email,
            token:generateToken(user._id),            
        });
    } catch (error) {
        res.status(500).json({message:"Server error during user registration",error:error.message});
    }
};

export const loginUser=async(req,res)=>{
    try{
        const {email,password}=req.body;
        if(!email||!password){
            return res.status(400).json({message:"Please provide both email and password"});
        }
        const user=await User.findOne({email});
        if(!user){
            return res.status(401).json({message:"Invalid credentials"});
        }
        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(401).json({message:"Invalid credentials"});
        }
        res.status(200).json({
            _id:user._id,
            name:user.name,
            email:user.email,
            token:generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({message:"Server error during user login",error:error.message});
    }
};

export const getUserProfile=async(req,res)=>{
    try{
        const user=await User.findById(req.user._id).select("-password");
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({message:"Server error while fetching user profile",error:error.message});
    }
};
