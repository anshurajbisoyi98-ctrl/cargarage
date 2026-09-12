import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { asyncHandler, fail, validateText } from '../middleware/index.js';
import { Vehicle } from '../models/index.js';
const profile=u=>({_id:u._id,username:u.username,email:u.email,isAdmin:u.isAdmin,phone:u.phone||'',avatar:u.avatar||''});
function session(res,user){res.cookie('session',jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'}),{httpOnly:true,sameSite:'strict',secure:process.env.NODE_ENV==='production',maxAge:604800000,path:'/'});}
export const register=asyncHandler(async(req,res)=>{
 const username=validateText(req.body.username,'Name',80);const email=validateText(req.body.email,'Email',254).toLowerCase();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))fail(400,'Enter a valid email address.');
 const password=validateText(req.body.password,'Password',72);if(password.length<10)fail(400,'Use at least 10 characters for your password.');
 const isAdmin=Boolean(req.body.isAdmin===true||req.body.isAdmin==='true'||req.body.role==='admin');
 const user=await User.create({username,email,password:await bcrypt.hash(password,12),isAdmin,phone:req.body.phone||''});session(res,user);res.status(201).json(profile(user));
});
export const login=asyncHandler(async(req,res)=>{
 const email=validateText(req.body.email,'Email',254).toLowerCase();const password=validateText(req.body.password,'Password',72);
 const user=await User.findOne({email}).select('+password');if(!user||!await bcrypt.compare(password,user.password))fail(401,'Incorrect email or password.');session(res,user);res.json(profile(user));
});
export const logout=(req,res)=>{res.clearCookie('session',{path:'/',httpOnly:true,sameSite:'strict',secure:process.env.NODE_ENV==='production'});res.json({message:'Signed out.'});};
export const me=(req,res)=>res.json(profile(req.user));

export const updateProfile=asyncHandler(async(req,res)=>{
 const user=await User.findById(req.user._id);
 if(!user)fail(404,'User not found.');
 if(req.body.username)user.username=validateText(req.body.username,'Name',80);
 if(req.body.phone!==undefined)user.phone=validateText(req.body.phone,'Phone',20);
 if(req.body.avatar!==undefined)user.avatar=req.body.avatar;
 if(req.body.email){
  const email=validateText(req.body.email,'Email',254).toLowerCase();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))fail(400,'Enter a valid email address.');
  user.email=email;
 }
 await user.save();
 res.json(profile(user));
});

export const toggleRole=asyncHandler(async(req,res)=>{
 if(!req.user.isAdmin)fail(403,'Only registered administrators can alter user roles.');
 const user=await User.findById(req.user._id);
 if(!user)fail(404,'User not found.');
 user.isAdmin=!user.isAdmin;
 await user.save();
 res.json(profile(user));
});

export const getAllUsers=asyncHandler(async(req,res)=>{
 const users=await User.find().sort({createdAt:-1});
 const counts=await Vehicle.aggregate([{$group:{_id:'$owner',count:{$sum:1}}}]);
 const countMap=new Map(counts.map(c=>[String(c._id),c.count]));
 const result=users.map(u=>({...profile(u),vehicleCount:countMap.get(String(u._id))||0,createdAt:u.createdAt}));
 res.json(result);
});

