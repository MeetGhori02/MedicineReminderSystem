import { Router, Response } from 'express';
import { protect, AuthRequest } from '../middleware/auth';
import {
  createMedicine,
  getMedicines,
  getTodayMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
  markMedicineTaken,
  getAdherenceStats,
} from '../services/medicineService';
import { sendSuccess, sendCreated, sendError, sendNotFound, sendServerError } from '../utils/response';

export const medicineRouter = Router();

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

// All medicine routes are protected
medicineRouter.use(protect);

// ─── GET /api/medicines ─────────────────────────────────────────────────────────
medicineRouter.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { date, search } = req.query as { date?: string; search?: string };
    const medicines = await getMedicines(req.user!.id, { date, search });
    sendSuccess(res, transformMedicines(medicines));
  } catch (error) {
    sendServerError(res, error instanceof Error ? error.message : 'Failed to fetch medicines');
  }
});

// ─── GET /api/medicines/today ───────────────────────────────────────────────────
medicineRouter.get('/today', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const medicines = await getTodayMedicines(req.user!.id);
    sendSuccess(res, transformMedicines(medicines));
  } catch (error) {
    sendServerError(res, error instanceof Error ? error.message : 'Failed to fetch today\'s medicines');
  }
});

// ─── GET /api/medicines/stats ───────────────────────────────────────────────────
medicineRouter.get('/stats', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const days = parseInt((req.query.days as string) || '7', 10);
    const stats = await getAdherenceStats(req.user!.id, days);
    sendSuccess(res, stats);
  } catch (error) {
    sendServerError(res, error instanceof Error ? error.message : 'Failed to fetch stats');
  }
});

// ─── GET /api/medicines/:id ─────────────────────────────────────────────────────
medicineRouter.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { sendError(res, 'Invalid ID'); return; }

    const medicine = await getMedicineById(id, req.user!.id);
    sendSuccess(res, transformMedicine(medicine));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Not found';
    sendNotFound(res, message);
  }
});

// ─── POST /api/medicines ────────────────────────────────────────────────────────
medicineRouter.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, dosage, date, time, frequency, beforeAfterFood, mealTimings, notes, reminderEnabled } = req.body;

    // Validate required fields
    if (!name || !dosage || !date || !time || !frequency || !beforeAfterFood) {
      sendError(res, 'name, dosage, date, time, frequency, and beforeAfterFood are required');
      return;
    }

    // Validate time format HH:MM
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(time)) {
      sendError(res, 'Time must be in HH:MM format (e.g., "08:30")');
      return;
    }

    const medicine = await createMedicine(req.user!.id, {
      name, dosage, date, time, frequency, beforeAfterFood, mealTimings, notes, reminderEnabled,
    });

    sendCreated(res, transformMedicine(medicine), 'Medicine added successfully');
  } catch (error) {
    sendServerError(res, error instanceof Error ? error.message : 'Failed to create medicine');
  }
});

// ─── PUT /api/medicines/:id ─────────────────────────────────────────────────────
medicineRouter.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { sendError(res, 'Invalid ID'); return; }

    const medicine = await updateMedicine(id, req.user!.id, req.body);
    sendSuccess(res, transformMedicine(medicine), 'Medicine updated successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Update failed';
    if (message === 'Medicine not found') { sendNotFound(res, message); return; }
    sendServerError(res, message);
  }
});

// ─── DELETE /api/medicines/:id ──────────────────────────────────────────────────
medicineRouter.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { sendError(res, 'Invalid ID'); return; }

    await deleteMedicine(id, req.user!.id);
    sendSuccess(res, null, 'Medicine deleted successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Delete failed';
    if (message === 'Medicine not found') { sendNotFound(res, message); return; }
    sendServerError(res, message);
  }
});

// ─── PATCH /api/medicines/:id/taken ────────────────────────────────────────────
medicineRouter.patch('/:id/taken', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { sendError(res, 'Invalid ID'); return; }

    const { taken } = req.body;
    if (typeof taken !== 'boolean') {
      sendError(res, '"taken" must be a boolean');
      return;
    }

    const medicine = await markMedicineTaken(id, req.user!.id, taken);
    sendSuccess(res, transformMedicine(medicine), taken ? 'Medicine marked as taken ✅' : 'Medicine marked as not taken');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Update failed';
    if (message === 'Medicine not found') { sendNotFound(res, message); return; }
    sendServerError(res, message);
  }
});
