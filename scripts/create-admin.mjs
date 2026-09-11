import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../backend/models/index.js';
const {ADMIN_EMAIL,ADMIN_PASSWORD,ADMIN_NAME='Service center'}=process.env;
if(!ADMIN_EMAIL||!ADMIN_PASSWORD||ADMIN_PASSWORD.length<10){console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 10 characters) before running.');process.exit(1);}
try{await mongoose.connect(process.env.MONGO_URI||process.env.db,{dbName:process.env.DB_NAME||'caranimation_service'});
if(await User.exists({email:ADMIN_EMAIL.toLowerCase()}))throw new Error('Account already exists; no account was changed.');
await User.create({username:ADMIN_NAME,email:ADMIN_EMAIL.toLowerCase(),password:await bcrypt.hash(ADMIN_PASSWORD,12),isAdmin:true});console.log('Service-center account created.');
}catch(error){console.error(error.message.includes('already exists')?error.message:'Unable to create account. Check configuration.');process.exitCode=1;}finally{await mongoose.disconnect();}
