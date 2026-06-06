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

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
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
