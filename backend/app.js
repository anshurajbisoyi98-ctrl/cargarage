import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { router } from './routes/index.js';

export const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '64kb' }));
app.use(cookieParser());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    const origin = req.get('origin');
    const allowed = (process.env.APP_ORIGIN || 'http://127.0.0.1:5175,http://localhost:5175').split(',').map(s => s.trim());
    const host = req.get('host');
    const isSameHost = origin && host && (origin.replace(/^https?:\/\//, '') === host);
    if (origin && !allowed.includes(origin) && !isSameHost) {
      return res.status(403).json({ message: 'Origin not allowed.' });
    }
    const hasBody = req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH';
    if (hasBody && !req.is('application/json')) return res.status(415).json({ message: 'JSON content type required.' });
  }
  next();
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api', router);
app.use('/api', (req, res) => res.status(404).json({ message: 'Endpoint not found.' }));

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

app.use((err, req, res, next) => {
  const status = err.status || (err.code === 11000 ? 409 : err.name === 'ValidationError' || err.name === 'CastError' ? 400 : 500);
  res.status(status).json({
    message: err.code === 11000 ? 'That email, registration, or service record already exists.' : status === 500 ? 'The request could not be completed. Please try again.' : err.message
  });
});
