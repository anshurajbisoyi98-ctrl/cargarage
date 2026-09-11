import express from 'express';
import cookieParser from 'cookie-parser';
import { router } from './routes/index.js';
export const app=express();
app.disable('x-powered-by');app.use(express.json({limit:'64kb'}));app.use(cookieParser());
app.use('/api',(req,res,next)=>{
 res.set('Cache-Control','no-store');
 if(!['GET','HEAD','OPTIONS'].includes(req.method)){
  const origin=req.get('origin');const allowed=(process.env.APP_ORIGIN||'http://127.0.0.1:5175').split(',');
  if(origin&&!allowed.includes(origin))return res.status(403).json({message:'Origin not allowed.'});
  // Only check content-type for requests that have a body
  const hasBody = req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH';
  if(hasBody && !req.is('application/json'))return res.status(415).json({message:'JSON content type required.'});
 }next();
});
app.get('/api/health',(req,res)=>res.json({status:'ok'}));app.use('/api',router);
app.use('/api',(req,res)=>res.status(404).json({message:'Endpoint not found.'}));
app.use((err,req,res,next)=>{
 const status=err.status||(err.code===11000?409:err.name==='ValidationError'||err.name==='CastError'?400:500);
 res.status(status).json({message:err.code===11000?'That email, registration, or service record already exists.':status===500?'The request could not be completed. Please try again.':err.message});
});
