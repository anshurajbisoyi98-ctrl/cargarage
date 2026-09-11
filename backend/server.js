import 'dotenv/config';
import mongoose from 'mongoose';
import { app } from './app.js';
if(!process.env.JWT_SECRET||process.env.JWT_SECRET.length<32)throw new Error('Set JWT_SECRET to at least 32 characters.');
try{await mongoose.connect(process.env.MONGO_URI||process.env.db,{dbName:process.env.DB_NAME||'caranimation_service',serverSelectionTimeoutMS:10000});
const port = Number(process.env.PORT) || 5001;
const host = process.env.HOST || '0.0.0.0';
app.listen(port, host, () => console.log(`Service API ready on http://${host}:${port}`));
}catch(e){console.error('Database connection failed. Check the URI and Atlas network access.', e);process.exitCode=1;}
