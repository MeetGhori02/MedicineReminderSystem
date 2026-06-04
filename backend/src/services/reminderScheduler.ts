import cron from 'node-cron';
import { prisma } from '../utils/prisma';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface PendingReminder {
  id: number;
  name: string;
  dosage: string;
  time: string;
  userId: number;
  user: { name: string; email: string };
}

// ─── Get current HH:MM time ────────────────────────────────────────────────────
const getCurrentTime = (): string => {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
};

// ─── Check medicines due right now ────────────────────────────────────────────
const checkDueMedicines = async (): Promise<void> => {
  const currentTime = getCurrentTime();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  try {
    // Find all medicines due at the current minute that haven't been taken
    const dueMedicines = await prisma.medicine.findMany({
      where: {
        time: currentTime,
        taken: false,
        reminderEnabled: true,
        OR: [
          { date: { gte: today, lt: tomorrow } },
          { frequency: 'DAILY' },
        ],
      },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    if (dueMedicines.length > 0) {
      console.log(`⏰ [${currentTime}] ${dueMedicines.length} medicine reminder(s) triggered:`);
      dueMedicines.forEach((med: PendingReminder) => {
        console.log(
          `  📋 ${med.user.name} (${med.user.email}): "${med.name}" ${med.dosage}`
        );
        // In a real system, you would:
        // 1. Send an email via SendGrid/Nodemailer
        // 2. Send a push notification via Firebase/OneSignal
        // 3. Send an SMS via Twilio
        // For now we log — frontend polls and shows browser notifications
      });
    }
  } catch (error) {
    console.error('❌ Reminder scheduler error:', error);
  }
};

// ─── Reset taken status at midnight for daily medicines ────────────────────────
const resetDailyMedicines = async (): Promise<void> => {
  try {
    const result = await prisma.medicine.updateMany({
      where: { frequency: 'DAILY', taken: true },
      data: { taken: false, takenAt: null },
    });
    console.log(`🔄 [MIDNIGHT] Reset ${result.count} daily medicine(s) to "not taken"`);
  } catch (error) {
    console.error('❌ Daily reset error:', error);
  }
};

// ─── Get upcoming reminders for a user (next 60 minutes) ─────────────────────
export const getUpcomingReminders = async (userId: number): Promise<PendingReminder[]> => {
  const now = new Date();
  const in60min = new Date(now.getTime() + 60 * 60 * 1000);

  const currentTime = getCurrentTime();
  const futureTime = `${String(in60min.getHours()).padStart(2, '0')}:${String(in60min.getMinutes()).padStart(2, '0')}`;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return prisma.medicine.findMany({
    where: {
      userId,
      taken: false,
      reminderEnabled: true,
      time: { gte: currentTime, lte: futureTime },
      OR: [
        { date: { gte: today, lt: tomorrow } },
        { frequency: 'DAILY' },
      ],
    },
    include: {
      user: { select: { name: true, email: true } },
    },
    orderBy: { time: 'asc' },
  }) as Promise<PendingReminder[]>;
};

// ─── Start all schedulers ──────────────────────────────────────────────────────
export const startReminderScheduler = (): void => {
  // Run every minute to check for due medicines
  cron.schedule('* * * * *', async () => {
    await checkDueMedicines();
  });

  // Reset daily medicines at midnight every day
  cron.schedule('0 0 * * *', async () => {
    await resetDailyMedicines();
  });

  console.log('✅ Reminder scheduler initialized (runs every minute)');
};
