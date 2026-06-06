import Medicine from '../models/Medicine';

// ─── Types ─────────────────────────────────────────────────────────────────────
export type Frequency = 'ONCE' | 'DAILY' | 'WEEKLY';
export type FoodTiming = 'BEFORE' | 'AFTER' | 'WITH';

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

// ─── Create medicine ───────────────────────────────────────────────────────────
export const createMedicine = async (userId: number, input: MedicineInput) => {
  const medicine = await Medicine.create({
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
  });

  return normalizeMedicine(medicine);
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
    where['date'] = { $gte: day, $lt: nextDay };
  }

  // Search by medicine name
  if (filters?.search) {
    where['name'] = { $regex: filters.search, $options: 'i' };
  }

  const medicines = await Medicine.find(where).sort({ date: 1, time: 1 }).lean();
  return medicines.map(normalizeMedicine);
};

// ─── Get today's medicines ─────────────────────────────────────────────────────
export const getTodayMedicines = async (userId: number) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const medicines = await Medicine.find({
    userId,
    $or: [
      { date: { $gte: today, $lt: tomorrow } },
      { frequency: 'DAILY' },
      { frequency: 'WEEKLY' },
    ],
  }).sort({ time: 1 }).lean();

  return medicines.map(normalizeMedicine);
};

// ─── Get medicine by ID ────────────────────────────────────────────────────────
export const getMedicineById = async (id: number, userId: number) => {
  const medicine = await Medicine.findOne({ _id: id, userId }).lean();
  if (!medicine) throw new Error('Medicine not found');
  return normalizeMedicine(medicine);
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

  const medicine = await Medicine.findOneAndUpdate(
    { _id: id, userId },
    { $set: updateData, $currentDate: { updatedAt: true } },
    { new: true }
  ).lean();

  if (!medicine) throw new Error('Medicine not found');
  return normalizeMedicine(medicine);
};

// ─── Delete medicine ───────────────────────────────────────────────────────────
export const deleteMedicine = async (id: number, userId: number) => {
  await getMedicineById(id, userId);
  return Medicine.deleteOne({ _id: id, userId });
};

// ─── Mark medicine as taken / untaken ─────────────────────────────────────────
export const markMedicineTaken = async (id: number, userId: number, taken: boolean) => {
  await getMedicineById(id, userId);
  const medicine = await Medicine.findOneAndUpdate(
    { _id: id, userId },
    {
      $set: {
        taken,
        takenAt: taken ? new Date() : null,
      },
      $currentDate: { updatedAt: true },
    },
    { new: true }
  ).lean();

  if (!medicine) throw new Error('Medicine not found');
  return normalizeMedicine(medicine);
};

// ─── Get adherence stats ───────────────────────────────────────────────────────
export const getAdherenceStats = async (userId: number, days = 7) => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const medicines = await Medicine.find({ userId, date: { $gte: since } }).select({ taken: 1, date: 1 }).lean();

  const total = medicines.length;
  const taken = medicines.filter((m) => m.taken).length;
  const missed = total - taken;
  const adherenceRate = total > 0 ? Math.round((taken / total) * 100) : 0;

  return { total, taken, missed, adherenceRate };
};
