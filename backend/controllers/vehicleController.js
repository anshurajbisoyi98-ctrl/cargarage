import mongoose from 'mongoose';
import { Vehicle, ServiceRequest, ServiceRecord } from '../models/index.js';
import { createNotification } from './notificationController.js';
import { asyncHandler, fail, ownedVehicle, validateText, validateDate, validateNumber } from '../middleware/index.js';
function fields(body){
 const purchaseDate=validateDate(body.purchaseDate,'Purchase date');if(purchaseDate>new Date())fail(400,'Purchase date cannot be in the future.');
 const base={registrationNumber:validateText(body.registrationNumber,'Registration',24).toUpperCase(),model:validateText(body.model,'Model',100),purchaseDate,mileage:validateNumber(body.mileage,'Mileage')};
 if(body.make)base.make=validateText(body.make,'Make',50);
 if(body.year)base.year=validateNumber(body.year,'Year');
 if(body.variant)base.variant=validateText(body.variant,'Variant',100);
 if(body.vin)base.vin=validateText(body.vin,'VIN',17);
 if(body.fuelType)base.fuelType=validateText(body.fuelType,'Fuel type',50);
 if(body.transmission)base.transmission=validateText(body.transmission,'Transmission',50);
 if(body.nickname)base.nickname=validateText(body.nickname,'Nickname',50);
 if(body.color)base.color=validateText(body.color,'Color',30);
 if(body.engineSize)base.engineSize=validateText(body.engineSize,'Engine size',30);
 return base;
}
export const registerVehicle=asyncHandler(async(req,res)=>{
 const vehicle=await Vehicle.create({...fields(req.body),owner:req.user._id});
 await createNotification(req.user._id,{title:'Vehicle Added',message:`${vehicle.model} (${vehicle.registrationNumber}) has been registered to your garage.`,type:'status_update'});
 res.status(201).json(vehicle);
});
export const getMyVehicles=asyncHandler(async(req,res)=>res.json(await Vehicle.find({owner:req.user._id}).sort({createdAt:-1})));
export const getVehicleById=asyncHandler(async(req,res)=>res.json(await ownedVehicle(req.params.id,req.user)));
export const updateVehicle=asyncHandler(async(req,res)=>{const v=await ownedVehicle(req.params.id,req.user);const next=fields(req.body);if(next.mileage<v.mileage)fail(400,'Mileage cannot decrease.');Object.assign(v,next);await v.save();res.json(v);});
export const deleteVehicle=asyncHandler(async(req,res)=>{
 await ownedVehicle(req.params.id,req.user);
 const cascade = req.query.cascade === 'true' || req.body?.cascade === true;
 await mongoose.connection.transaction(async session=>{
  if(!cascade && await ServiceRequest.exists({vehicle:req.params.id}).session(session))fail(409,'Vehicles with bookings or service history cannot be deleted.');
  if(cascade){
   await ServiceRecord.deleteMany({vehicle:req.params.id},{session});
   await ServiceRequest.deleteMany({vehicle:req.params.id},{session});
  }
  await Vehicle.deleteOne({_id:req.params.id},{session});
 });res.json({message:'Vehicle deleted.'});
});
export const getVehicleServiceHistory=asyncHandler(async(req,res)=>{await ownedVehicle(req.params.id,req.user);res.json(await ServiceRecord.find({vehicle:req.params.id}).sort({serviceDate:-1}));});
export const getReminder=asyncHandler(async(req,res)=>{
 const v=await ownedVehicle(req.params.id,req.user);const record=await ServiceRecord.findOne({vehicle:v._id}).sort({serviceDate:-1});
 const months=Number(process.env.SERVICE_REMINDER_MONTHS_INTERVAL)||6;const km=Number(process.env.SERVICE_REMINDER_MILEAGE_INTERVAL)||5000;
 const dueDate=new Date(record?.serviceDate||v.purchaseDate);dueDate.setMonth(dueDate.getMonth()+months);
 const dueMileage=(record?.mileage||0)+km;
 res.json({dueByMileage:v.mileage>=dueMileage,dueByDate:new Date()>=dueDate,dueDate,dueMileage,baseline:record?'last-service':'purchase'});
});
