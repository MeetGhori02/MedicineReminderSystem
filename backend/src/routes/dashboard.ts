import { Router, Response } from 'express';
import { protect, AuthRequest, adminOnly } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { sendSuccess, sendServerError } from '../utils/response';

export const dashboardRouter = Router();
dashboardRouter.use(protect);

// Helper to transform medicine data (parse JSON mealTimings)
const transformMedicine = (medicine: any) => {
  return {
    ...medicine,
    mealTimings: medicine.mealTimings ? JSON.parse(medicine.mealTimings) : [],
  };
};

const transformMedicines = (medicines: any[]) => medicines.map(transformMedicine);

// ─── GET /api/dashboard/summary ────────────────────────────────────────────────
dashboardRouter.get('/summary', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch today's medicines
    const todayMedicines = await prisma.medicine.findMany({
      where: {
        userId,
        OR: [
          { date: { gte: today, lt: tomorrow } },
          { frequency: 'DAILY' },
        ],
      },
      orderBy: { time: 'asc' },
    });

    // Stats over last 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekMedicines = await prisma.medicine.findMany({
      where: { userId, date: { gte: weekAgo } },
      select: { taken: true },
    });

    const totalWeek = weekMedicines.length;
    const takenWeek = weekMedicines.filter((m) => m.taken).length;
    const missedWeek = totalWeek - takenWeek;
    const adherenceRate = totalWeek > 0 ? Math.round((takenWeek / totalWeek) * 100) : 0;

    // Upcoming (next 3 days), including DAILY medicines by next occurrence time
    const now = new Date();
    const threeDaysLater = new Date(now);
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);

    const upcomingCandidates = await prisma.medicine.findMany({
      where: {
        userId,
        taken: false,
        OR: [
          { frequency: 'DAILY' },
          { date: { gte: today, lt: threeDaysLater } },
        ],
      },
    });

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

        return {
          ...medicine,
          date: nextDate,
        };
      })
      .filter((medicine) => medicine.date >= now && medicine.date < threeDaysLater)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5);

    // Total medicines count
    const totalMedicines = await prisma.medicine.count({ where: { userId } });

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
    const totalUsers = await prisma.user.count();
    const totalMedicines = await prisma.medicine.count();
    const takenMedicines = await prisma.medicine.count({ where: { taken: true } });
    const pendingMedicines = await prisma.medicine.count({ where: { taken: false } });

    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { medicines: true } },
      },
    });

    sendSuccess(res, {
      stats: { totalUsers, totalMedicines, takenMedicines, pendingMedicines },
      recentUsers,
    });
  } catch (error) {
    sendServerError(res, error instanceof Error ? error.message : 'Admin fetch failed');
  }
});
