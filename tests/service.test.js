import 'dotenv/config';
import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { app } from '../backend/app.js';
import { User } from '../backend/models/index.js';
test('owner isolation and full service lifecycle',{timeout:20000},async()=>{
 const dbName='test_'+randomUUID().replaceAll('-','').slice(0,26);
 let server;
 try{
 await mongoose.connect(process.env.MONGO_URI||process.env.db,{dbName,serverSelectionTimeoutMS:10000});
 server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));
 const base=`http://127.0.0.1:${server.address().port}/api`;
 async function request(path,method='GET',body,cookie=''){
 const headers={Cookie:cookie};
 if(!['GET','HEAD','OPTIONS'].includes(method))headers['Content-Type']='application/json';
 const response=await fetch(base+path,{method,headers,...(body?{body:JSON.stringify(body)}:{})});
 const data=await response.json();
 if(response.status>=500)console.error('Server error:',response.status,data);
 return {status:response.status,data,cookie:response.headers.get('set-cookie')?.split(';')[0]};
 }
 const owner=await request('/users/register','POST',{username:'Test owner',email:'owner@test.example',password:'test-only-password'});assert.equal(owner.status,201);assert.equal(owner.data.isAdmin,false);
 const adminReg=await request('/users/register','POST',{username:'Admin Reg',email:'adminreg@test.example',password:'test-only-password',isAdmin:true});assert.equal(adminReg.status,201);assert.equal(adminReg.data.isAdmin,true);
 const other=await request('/users/register','POST',{username:'Other',email:'other@test.example',password:'test-only-password'});
 await User.create({username:'Staff',email:'staff@test.example',password:await bcrypt.hash('test-only-password',4),isAdmin:true});
 const staff=await request('/users/login','POST',{email:'staff@test.example',password:'test-only-password'});
 assert.equal((await request('/vehicles')).status,401);
 const vehicleData={registrationNumber:'TEST-68',model:'Mustang',purchaseDate:'2020-01-01',mileage:10000};
 const vehicle=await request('/vehicles','POST',vehicleData,owner.cookie);assert.equal(vehicle.status,201);const id=vehicle.data._id;
 assert.equal((await request('/vehicles/'+id+'/history','GET',null,other.cookie)).status,403);
 assert.equal((await request('/service-records/vehicle/'+id,'GET',null,other.cookie)).status,403);
 assert.equal((await request('/vehicles/'+id,'PUT',{...vehicleData,mileage:10100},owner.cookie)).status,200);
 assert.equal((await request('/service-requests','GET',null,owner.cookie)).status,403);
 const booking=await request('/service-requests','POST',{vehicle:id,problemDescription:'Brake service',preferredDate:new Date(Date.now()+86400000).toISOString()},owner.cookie);assert.equal(booking.status,201);
 const rid=booking.data._id;
 assert.equal((await request('/service-requests/'+rid+'/accept','PUT',{},owner.cookie)).status,403);
 assert.equal((await request('/service-requests/'+rid+'/accept','PUT',{},staff.cookie)).status,200);
 assert.equal((await request('/service-requests/'+rid+'/reject','PUT',{},staff.cookie)).status,409);
 const record=await request('/service-records','POST',{serviceRequest:rid,mileage:10100,laborCost:200,partsReplaced:[{name:'Pads',cost:400}],totalCost:1},staff.cookie);assert.equal(record.status,201);assert.equal(record.data.totalCost,600);
 assert.equal((await request('/service-records','POST',{serviceRequest:rid,mileage:10100,laborCost:200,partsReplaced:[]},staff.cookie)).status,409);
 const history=await request('/vehicles/'+id+'/history','GET',null,owner.cookie);assert.equal(history.data.length,1);
 const dash=await request('/dashboard/owner','GET',null,owner.cookie);assert.equal(dash.data.totalServiceCost,600);
 assert.equal((await request('/dashboard/owner','GET',null,other.cookie)).data.totalServiceCost,0);
 assert.equal((await request('/vehicles/'+id,'DELETE',null,owner.cookie)).status,409);
 const removable=await request('/vehicles','POST',{...vehicleData,registrationNumber:'REMOVE-TEST'},owner.cookie);
 assert.equal((await request('/vehicles/'+removable.data._id,'DELETE',null,owner.cookie)).status,200);
 assert.equal((await request('/vehicles/'+id+'/reminder','GET',null,owner.cookie)).status,200);
 }finally{
 try{if(server)server.closeAllConnections();}catch{}
 try{if(server)server.close();}catch{}
 if(mongoose.connection.readyState===1){
   try{if(mongoose.connection.name===dbName)await mongoose.connection.dropDatabase();}catch{}
 }
 try{await mongoose.disconnect();}catch{}
 await new Promise(resolve=>setTimeout(resolve,200));
 }
});
