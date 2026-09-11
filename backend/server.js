import 'dotenv/config';
import mongoose from 'mongoose';
import { app } from './app.js';
if(!process.env.JWT_SECRET||process.env.JWT_SECRET.length<32)throw new Error('Set JWT_SECRET to at least 32 characters.');
try{await mongoose.connect(process.env.MONGO_URI||process.env.db,{dbName:process.env.DB_NAME||'caranimation_service',serverSelectionTimeoutMS:10000});
app.listen(Number(process.env.PORT)||5001,'127.0.0.1',()=>console.log('Service API ready on http://127.0.0.1:'+(process.env.PORT||5001)));
}catch{console.error('Database connection failed. Check the URI and Atlas network access.');process.exitCode=1;}
