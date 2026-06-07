import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth';
import { medicineRouter } from './routes/medicines';
import { dashboardRouter } from './routes/dashboard';
import { errorHandler } from './middleware/errorHandler';
import { startReminderScheduler } from './services/reminderScheduler';
import connectMongo from './utils/mongo';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const normalizeOrigin = (origin: string): string => origin.replace(/\/$/, '');

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGIN,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]
  .filter((origin): origin is string => Boolean(origin))
  .map(normalizeOrigin);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    const requestOrigin = normalizeOrigin(origin);
    if (allowedOrigins.includes(requestOrigin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
};

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/medicines', medicineRouter);
app.use('/api/dashboard', dashboardRouter);

// ─── Global error handler ──────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start server (connect to Mongo first) ───────────────────────────────────────
(async () => {
  try {
    await connectMongo();
    app.listen(PORT, () => {
      console.log(`🚀 MRS Backend running on http://localhost:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);

      // Start the background reminder scheduler
      startReminderScheduler();
      console.log('⏰ Reminder scheduler started');
    });
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  }
})();

export default app;
