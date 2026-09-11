import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User, Vehicle } from '../models/index.js';
export const asyncHandler = fn => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next);
export function fail(status,message){ const error=new Error(message);error.status=status;throw error; }
export const authenticate=asyncHandler(async(req,res,next)=>{
 const token=req.cookies.session;
 if(!token) fail(401,'Please sign in.');
 let payload;try{payload=jwt.verify(token,process.env.JWT_SECRET);}catch{fail(401,'Session expired. Please sign in again.');}
 req.user=await User.findById(payload.id);if(!req.user)fail(401,'Account not found.');next();
});
export const authorizeAdmin=(req,res,next)=>{if(!req.user.isAdmin)return next(Object.assign(new Error('Service-center access required.'),{status:403}));next();};
export const checkId=(req,res,next)=>{if(!mongoose.isObjectIdOrHexString(req.params.id))return next(Object.assign(new Error('Invalid identifier.'),{status:400}));next();};
export async function ownedVehicle(id,user){
 if(!mongoose.isObjectIdOrHexString(id))fail(400,'Invalid vehicle identifier.');
 const vehicle=await Vehicle.findById(id);if(!vehicle)fail(404,'Vehicle not found.');
 if(!user.isAdmin && String(vehicle.owner)!==String(user._id))fail(403,'This vehicle belongs to another owner.');return vehicle;
}
export function validateText(value,name,max=2000){if(typeof value!=='string'||!value.trim()||value.trim().length>max)fail(400,`${name} is required and must be at most ${max} characters.`);return value.trim();}
export function validateNumber(value,name){if(typeof value!=='number'||!Number.isFinite(value)||value<0||value>1e9)fail(400,`${name} must be a valid non-negative number.`);return value;}
export function validateDate(value,name){const date=new Date(value);if(!value||Number.isNaN(date.getTime()))fail(400,`${name} must be a valid date.`);return date;}
