import mongoose from 'mongoose';
import { ServiceRequest, ServiceRecord, Vehicle } from '../models/index.js';
import { createNotification } from './notificationController.js';
import { asyncHandler, fail, ownedVehicle, validateText, validateDate, validateNumber } from '../middleware/index.js';

export const createServiceRequest=asyncHandler(async(req,res)=>{
 const vehicle=await ownedVehicle(req.body.vehicle,req.user);if(String(vehicle.owner)!==String(req.user._id))fail(403,'Book services for your own vehicles.');
 const problemDescription=validateText(req.body.problemDescription,'Problem description');
 const preferredDate=validateDate(req.body.preferredDate,'Preferred date');
 const preferredTime=req.body.preferredTime?validateText(req.body.preferredTime,'Preferred time',10):'';
 const serviceType=req.body.serviceType?validateText(req.body.serviceType,'Service type',100):'General Service';
 const today=new Date();today.setHours(0,0,0,0);if(preferredDate<today)fail(400,'Choose today or a future service date.');
 let result;await mongoose.connection.transaction(async session=>{
  const locked=await Vehicle.updateOne({_id:vehicle._id},{$set:{updatedAt:new Date()}},{session});if(!locked.matchedCount)fail(404,'Vehicle not found.');
  result=(await ServiceRequest.create([{vehicle:vehicle._id,owner:req.user._id,serviceCenter:req.body.serviceCenter||undefined,problemDescription,preferredDate,preferredTime,serviceType,currentStage:'booked'}],{session}))[0];
  await createNotification(req.user._id,{title:'Service Request Sent',message:`Your booking for ${serviceType} has been dispatched to the service center.`,type:'booking',relatedId:String(result._id)});
 });res.status(201).json(result);
});

export const getMyServiceRequests=asyncHandler(async(req,res)=>res.json(await ServiceRequest.find({owner:req.user._id}).populate('vehicle').populate('serviceCenter').sort({createdAt:-1})));
export const getAllRequests=asyncHandler(async(req,res)=>res.json(await ServiceRequest.find().populate('vehicle').populate('owner','username email').populate('serviceCenter').sort({createdAt:-1})));

export const cancelServiceRequest=asyncHandler(async(req,res)=>{
 const request=await ServiceRequest.findById(req.params.id).populate('vehicle owner');
 if(!request)fail(404,'Service request not found.');
 if(!req.user.isAdmin&&String(request.owner._id)!==String(req.user._id))fail(403,'You can only cancel your own bookings.');
 if(['completed','cancelled'].includes(request.status))fail(409,'Completed or cancelled bookings cannot be changed.');
 const reason=req.body.reason||'Cancelled by client';
 request.status='cancelled';request.cancelReason=reason;await request.save();
 await createNotification(request.owner._id,{title:'Booking Cancelled',message:`Your service booking for ${request.vehicle?.model||'vehicle'} was cancelled. Reason: ${reason}`,type:'status_update',relatedId:String(request._id)});
 res.json(request);
});

export const getAllRecords=asyncHandler(async(req,res)=>{
 const records=await ServiceRecord.find().populate('vehicle').sort({serviceDate:-1});
 res.json(records);
});

export const deleteServiceRecord=asyncHandler(async(req,res)=>{
 const record=await ServiceRecord.findById(req.params.id);
 if(!record)fail(404,'Service record not found.');
 await record.deleteOne();
 res.json({message:'Service record deleted.'});
});

export const transitionRequest=status=>asyncHandler(async(req,res)=>{
 const request=await ServiceRequest.findOneAndUpdate({_id:req.params.id,status:'pending'},{$set:{status,currentStage:status==='accepted'?'accepted':'booked',assignedTechnician:status==='accepted'?(req.body.assignedTechnician||'Service Team'):undefined,rejectionReason:status==='rejected'?req.body.rejectionReason:undefined}},{new:true}).populate('vehicle owner');
 if(!request)fail(409,'Only pending requests can be accepted or rejected.');
 const message=status==='accepted'?`Your appointment on ${new Date(request.preferredDate).toLocaleDateString()} is confirmed with ${request.assignedTechnician}.`:`Request declined: ${request.rejectionReason||'Unavailable'}`;
 await createNotification(request.owner._id,{title:`Service Request ${status==='accepted'?'Accepted':'Declined'}`,message,type:'status_update',relatedId:req.params.id});
 res.json(request);
});

export const updateStage=asyncHandler(async(req,res)=>{
 const stage=req.body.stage;const validStages=['vehicle_received','inspection','in_progress','ready','completed'];
 if(!validStages.includes(stage))fail(400,'Invalid stage.');
 const request=await ServiceRequest.findOneAndUpdate({_id:req.params.id,status:{$in:['accepted','in_progress']}},{$set:{currentStage:stage,status:stage==='completed'?'completed':'in_progress'}},{new:true}).populate('vehicle owner');
 if(!request)fail(404,'Request not found or cannot be updated.');
 const stageTitles={vehicle_received:'Vehicle Received',inspection:'Inspection Underway',in_progress:'Work in Progress',ready:'Ready for Collection',completed:'Service Completed'};
 await createNotification(request.owner._id,{title:stageTitles[stage],message:`Your vehicle service has progressed to: ${stageTitles[stage]}`,type:'status_update',relatedId:req.params.id});
 res.json(request);
});

export const createServiceRecord=asyncHandler(async(req,res)=>{
 const id=req.body.serviceRequest;if(!mongoose.isObjectIdOrHexString(id))fail(400,'Invalid service request.');
 const parts=req.body.partsReplaced??[];if(!Array.isArray(parts)||parts.length>100)fail(400,'Provide up to 100 parts.');
 const partsReplaced=parts.map(p=>({name:validateText(p.name,'Part name',100),cost:validateNumber(p.cost,'Part cost')}));
 const laborCost=validateNumber(req.body.laborCost,'Labor cost');const mileage=validateNumber(req.body.mileage,'Service mileage');
 const serviceDate=validateDate(req.body.serviceDate||new Date(),'Service date');if(serviceDate>new Date())fail(400,'Completed work cannot be dated in the future.');
 const serviceType=req.body.serviceType?validateText(req.body.serviceType,'Service type',100):'';
 const notes=req.body.notes?validateText(req.body.notes,'Notes'):'';
 const recommendedNextDate=req.body.recommendedNextDate?validateDate(req.body.recommendedNextDate,'Recommended next date'):null;
 const recommendedNextMileage=req.body.recommendedNextMileage?validateNumber(req.body.recommendedNextMileage,'Recommended next mileage'):null;
 const totalCost=Math.round((partsReplaced.reduce((sum,p)=>sum+p.cost,0)+laborCost)*100)/100;
 const invoiceNumber=`INV-${new Date().getFullYear()}-${String(Math.floor(1000+Math.random()*9000))}`;
 let record;
 await mongoose.connection.transaction(async session=>{
  const request=await ServiceRequest.findOneAndUpdate({_id:id,status:{$in:['accepted','in_progress']}},{$set:{status:'completed',currentStage:'completed'}},{new:true,session}).populate('owner');
  if(!request)fail(409,'Only accepted or in-progress requests can be completed, once.');
  const vehicle=await Vehicle.findById(request.vehicle).session(session);if(!vehicle)fail(404,'Vehicle not found.');if(mileage<vehicle.mileage)fail(400,'Service mileage cannot be below current mileage.');
  vehicle.mileage=mileage;await vehicle.save({session});
  record=(await ServiceRecord.create([{serviceRequest:id,vehicle:vehicle._id,invoiceNumber,serviceType,partsReplaced,laborCost,totalCost,serviceDate,mileage,recommendedNextDate,recommendedNextMileage,notes}],{session}))[0];
  await createNotification(request.owner._id,{title:`Invoice ${invoiceNumber} Generated`,message:`Completed ${serviceType||'service'}. Total: ₹${totalCost.toLocaleString()}. ${recommendedNextMileage?`Next service at ${recommendedNextMileage.toLocaleString()} km.`:''}`,type:'status_update',relatedId:String(record._id)});
 });res.status(201).json(record);
});

export const dashboard=admin=>asyncHandler(async(req,res)=>{
 const vehicles=await Vehicle.find(admin?{}:{owner:req.user._id});const ids=vehicles.map(v=>v._id);
 const records=await ServiceRecord.find({vehicle:{$in:ids}}).populate('vehicle').sort({serviceDate:-1});
 const today=new Date();today.setHours(0,0,0,0);
 const upcomingServices=await ServiceRequest.find({vehicle:{$in:ids},status:{$in:['accepted','in_progress']},preferredDate:{$gte:today}}).populate('vehicle').sort({preferredDate:1});
 res.json({vehicleCount:vehicles.length,totalServiceCost:Math.round(records.reduce((s,r)=>s+r.totalCost,0)*100)/100,upcomingServices,completedServices:records});
});

