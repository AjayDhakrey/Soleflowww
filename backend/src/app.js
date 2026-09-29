import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { adminRouter } from './routes/admin.js';
import { reportsRouter } from './routes/reports.js';
import { documentsRouter } from './routes/documents.js';
import { aiRouter } from './routes/ai.js';
import { errorHandler } from './middleware/errorHandler.js';
import { supabaseAdmin } from './lib/supabaseAdmin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, '../../frontend/dist');

export const app = express();

// 1. Security Headers & CORS
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows flexible SPA inline assets while keeping headers hardened
    crossOriginEmbedderPolicy: false,
  })
);

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:3000', 'http://localhost:5173', 'https://soleflow.vercel.app'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy'));
      }
    },
    credentials: true,
  })
);

// 2. Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 300, // Limit each IP to 300 requests per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// 3. Body Parsers
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// 4. Health Check
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'soleflow-backend',
    version: '1.0.0',
    adminAvailable: Boolean(supabaseAdmin),
    timestamp: new Date().toISOString(),
  });
});

// 5. Modular API Routes
app.use('/api/admin', adminRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/documents', documentsRouter);
app.use('/api', documentsRouter); // Allows both /api/documents/orders/:id/pdf and /api/orders/:id/pdf
app.use('/api/ai', aiRouter);

// 404 handler for API routes
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// 6. Static Frontend Files & SPA Routing
app.use(express.static(distPath));

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// 7. Centralized Error Handler
app.use(errorHandler);
