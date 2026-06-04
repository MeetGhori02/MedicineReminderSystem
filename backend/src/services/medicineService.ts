import { Frequency, FoodTiming } from '@prisma/client';
import { prisma } from '../utils/prisma';

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface MedicineInput {
  name: string;
  dosage: string;
  date: string;          // ISO date string e.g. "2024-01-15"
  time: string;          // "HH:MM" e.g. "08:30"
  frequency: Frequency;
  beforeAfterFood: FoodTiming;
  mealTimings?: string[];  // Array of meal timings: ["AFTER_BREAKFAST", "AFTER_LUNCH", "AFTER_DINNER"]
  notes?: string;
  reminderEnabled?: boolean;
}

// ─── Create medicine ───────────────────────────────────────────────────────────
export const createMedicine = async (userId: number, input: MedicineInput) => {
  return prisma.medicine.create({
    data: {
      userId,
      name: input.name.trim(),
      dosage: input.dosage.trim(),
      date: new Date(input.date),
      time: input.time,
      frequency: input.frequency,
      beforeAfterFood: input.beforeAfterFood,
      mealTimings: input.mealTimings ? JSON.stringify(input.mealTimings) : null,
      notes: input.notes?.trim() || null,
      reminderEnabled: input.reminderEnabled ?? true,
      taken: false,
    },
  });
};

// ─── Get all medicines for a user ──────────────────────────────────────────────
export const getMedicines = async (
  userId: number,
  filters?: { date?: string; search?: string }
) => {
  const where: Record<string, unknown> = { userId };

  // Filter by specific date
  if (filters?.date) {
    const day = new Date(filters.date);
    const nextDay = new Date(day);
    nextDay.setDate(nextDay.getDate() + 1);
    where['date'] = { gte: day, lt: nextDay };
  }

  // Search by medicine name
  if (filters?.search) {
    where['name'] = { contains: filters.search };
  }

  return prisma.medicine.findMany({
    where,
    orderBy: [{ date: 'asc' }, { time: 'asc' }],
  });
};

// ─── Get today's medicines ─────────────────────────────────────────────────────
export const getTodayMedicines = async (userId: number) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return prisma.medicine.findMany({
    where: {
      userId,
      OR: [
        // Medicines scheduled for today
        { date: { gte: today, lt: tomorrow } },
        // Daily medicines from any date
        { frequency: 'DAILY' },
        // Weekly medicines (simplified: just show enabled ones)
        { frequency: 'WEEKLY' },
      ],
    },
    orderBy: { time: 'asc' },
  });
};

// ─── Get medicine by ID ────────────────────────────────────────────────────────
export const getMedicineById = async (id: number, userId: number) => {
  const medicine = await prisma.medicine.findFirst({
    where: { id, userId },
  });
  if (!medicine) throw new Error('Medicine not found');
  return medicine;
};

// ─── Update medicine ───────────────────────────────────────────────────────────
export const updateMedicine = async (
  id: number,
  userId: number,
  input: Partial<MedicineInput>
) => {
  // Verify ownership
  await getMedicineById(id, userId);

  const updateData: Record<string, unknown> = {};
  if (input.name !== undefined) updateData['name'] = input.name.trim();
  if (input.dosage !== undefined) updateData['dosage'] = input.dosage.trim();
  if (input.date !== undefined) updateData['date'] = new Date(input.date);
  if (input.time !== undefined) updateData['time'] = input.time;
  if (input.frequency !== undefined) updateData['frequency'] = input.frequency;
  if (input.mealTimings !== undefined) updateData['mealTimings'] = input.mealTimings ? JSON.stringify(input.mealTimings) : null;
  if (input.beforeAfterFood !== undefined) updateData['beforeAfterFood'] = input.beforeAfterFood;
  if (input.notes !== undefined) updateData['notes'] = input.notes?.trim() || null;
  if (input.reminderEnabled !== undefined) updateData['reminderEnabled'] = input.reminderEnabled;

  return prisma.medicine.update({ where: { id }, data: updateData });
};

// ─── Delete medicine ───────────────────────────────────────────────────────────
export const deleteMedicine = async (id: number, userId: number) => {
  await getMedicineById(id, userId);
  return prisma.medicine.delete({ where: { id } });
};

// ─── Mark medicine as taken / untaken ─────────────────────────────────────────
export const markMedicineTaken = async (id: number, userId: number, taken: boolean) => {
  await getMedicineById(id, userId);
  return prisma.medicine.update({
    where: { id },
    data: {
      taken,
      takenAt: taken ? new Date() : null,
    },
  });
};

// ─── Get adherence stats ───────────────────────────────────────────────────────
export const getAdherenceStats = async (userId: number, days = 7) => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const medicines = await prisma.medicine.findMany({
    where: { userId, date: { gte: since } },
    select: { taken: true, date: true },
  });

  const total = medicines.length;
  const taken = medicines.filter((m) => m.taken).length;
  const missed = total - taken;
  const adherenceRate = total > 0 ? Math.round((taken / total) * 100) : 0;

  return { total, taken, missed, adherenceRate };
};
