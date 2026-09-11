import 'dotenv/config';
import mongoose from 'mongoose';
import { app } from './app.js';
if(!process.env.JWT_SECRET||process.env.JWT_SECRET.length<32)throw new Error('Set JWT_SECRET to at least 32 characters.');
const port = Number(process.env.PORT) || 5001;
const host = process.env.HOST || '0.0.0.0';

app.listen(port, host, () => {
  console.log(`Service API ready on http://${host}:${port}`);
});

const mongoUri = process.env.MONGO_URI || process.env.db;
const dbName = process.env.DB_NAME || 'caranimation_service';

async function connectDb() {
  try {
    await mongoose.connect(mongoUri, {
      dbName,
      serverSelectionTimeoutMS: 20000
    });
    console.log('Connected to MongoDB Atlas successfully.');
  } catch (err) {
    console.error('Database connection error (retrying in 4s):', err.message);
    setTimeout(connectDb, 4000);
  }
}

connectDb();

