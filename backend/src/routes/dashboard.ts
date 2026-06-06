import { Router, Response } from 'express';
import { protect, AuthRequest, adminOnly } from '../middleware/auth';
import User from '../models/User';
import Medicine from '../models/Medicine';
import { sendSuccess, sendServerError } from '../utils/response';

export const dashboardRouter = Router();
dashboardRouter.use(protect);

// Helper to transform medicine data (parse JSON mealTimings)
const transformMedicine = (medicine: any) => {
  const mealTimings = Array.isArray(medicine.mealTimings)
    ? medicine.mealTimings
    : medicine.mealTimings
      ? JSON.parse(medicine.mealTimings)
      : [];

  return {
    ...medicine,
    mealTimings,
  };
};

const transformMedicines = (medicines: any[]) => medicines.map(transformMedicine);

const normalizeMedicine = (medicine: any) => ({
  id: medicine._id,
  userId: medicine.userId,
  name: medicine.name,
  dosage: medicine.dosage,
  date: medicine.date,
  time: medicine.time,
  frequency: medicine.frequency,
  beforeAfterFood: medicine.beforeAfterFood,
  mealTimings: medicine.mealTimings ? JSON.parse(medicine.mealTimings) : [],
  notes: medicine.notes ?? null,
  reminderEnabled: medicine.reminderEnabled,
  taken: medicine.taken,
  takenAt: medicine.takenAt,
  createdAt: medicine.createdAt,
  updatedAt: medicine.updatedAt,
});

// ─── GET /api/dashboard/summary ────────────────────────────────────────────────
dashboardRouter.get('/summary', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch today's medicines
    const todayMedicines = (await Medicine.find({
      userId,
      $or: [
        { date: { $gte: today, $lt: tomorrow } },
        { frequency: 'DAILY' },
      ],
    }).sort({ time: 1 }).lean()).map(normalizeMedicine);

    // Stats over last 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekMedicines = await Medicine.find({ userId, date: { $gte: weekAgo } }).select({ taken: 1 }).lean();

    const totalWeek = weekMedicines.length;
    const takenWeek = weekMedicines.filter((m) => m.taken).length;
    const missedWeek = totalWeek - takenWeek;
    const adherenceRate = totalWeek > 0 ? Math.round((takenWeek / totalWeek) * 100) : 0;

    // Upcoming (next 3 days), including DAILY medicines by next occurrence time
    const now = new Date();
    const threeDaysLater = new Date(now);
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);

    const upcomingCandidates = await Medicine.find({
      userId,
      taken: false,
      $or: [
        { frequency: 'DAILY' },
        { date: { $gte: today, $lt: threeDaysLater } },
      ],
    }).lean();

    const upcoming = upcomingCandidates
      .map((medicine) => {
        let nextDate = new Date(medicine.date);

        if (medicine.frequency === 'DAILY') {
          const [hour, minute] = medicine.time.split(':').map(Number);
          nextDate = new Date(now);
          nextDate.setHours(hour, minute, 0, 0);
          if (nextDate <= now) {
            nextDate.setDate(nextDate.getDate() + 1);
          }
        }

        return normalizeMedicine({ ...medicine, date: nextDate });
      })
      .filter((medicine) => new Date(medicine.date) >= now && new Date(medicine.date) < threeDaysLater)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5);

    // Total medicines count
    const totalMedicines = await Medicine.countDocuments({ userId });

    sendSuccess(res, {
      today: {
        medicines: transformMedicines(todayMedicines),
        total: todayMedicines.length,
        taken: todayMedicines.filter((m) => m.taken).length,
        pending: todayMedicines.filter((m) => !m.taken).length,
      },
      week: {
        total: totalWeek,
        taken: takenWeek,
        missed: missedWeek,
        adherenceRate,
      },
      upcoming: transformMedicines(upcoming),
      totalMedicines,
    });
  } catch (error) {
    sendServerError(res, error instanceof Error ? error.message : 'Dashboard fetch failed');
  }
});

// ─── GET /api/dashboard/admin (admin only) ─────────────────────────────────────
dashboardRouter.get('/admin', adminOnly, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    const totalMedicines = await Medicine.countDocuments();
    const takenMedicines = await Medicine.countDocuments({ taken: true });
    const pendingMedicines = await Medicine.countDocuments({ taken: false });

    const recentUsersRaw = await User.find().sort({ createdAt: -1 }).limit(10).lean();
    const recentUsers = await Promise.all(
      recentUsersRaw.map(async (user: any) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        _count: { medicines: await Medicine.countDocuments({ userId: user._id }) },
      }))
    );

    sendSuccess(res, {
      stats: { totalUsers, totalMedicines, takenMedicines, pendingMedicines },
      recentUsers,
    });
  } catch (error) {
    sendServerError(res, error instanceof Error ? error.message : 'Admin fetch failed');
  }
});
