// ─── Enums ─────────────────────────────────────────────────────────────────────
export type Frequency = 'ONCE' | 'DAILY' | 'WEEKLY';
export type FoodTiming = 'BEFORE' | 'AFTER' | 'WITH';
export type MealTiming = 'AFTER_BREAKFAST' | 'AFTER_LUNCH' | 'AFTER_DINNER';
export type UserRole = 'USER' | 'ADMIN';

// ─── API Response wrapper ──────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ─── User ─────────────────────────────────────────────────────────────────────
export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  _count?: { medicines: number };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// ─── Medicine ─────────────────────────────────────────────────────────────────
export interface Medicine {
  id: number;
  userId: number;
  name: string;
  dosage: string;
  date: string;
  time: string;
  frequency: Frequency;
  beforeAfterFood: FoodTiming;
  mealTimings: MealTiming[];
  notes: string | null;
  reminderEnabled: boolean;
  taken: boolean;
  takenAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MedicineFormData {
  name: string;
  dosage: string;
  date: string;
  time: string;
  frequency: Frequency;
  mealTimings: MealTiming[];
  beforeAfterFood: FoodTiming;
  notes: string;
  reminderEnabled: boolean;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export interface DashboardSummary {
  today: {
    medicines: Medicine[];
    total: number;
    taken: number;
    pending: number;
  };
  week: {
    total: number;
    taken: number;
    missed: number;
    adherenceRate: number;
  };
  upcoming: Medicine[];
  totalMedicines: number;
}

// ─── Stats ────────────────────────────────────────────────────────────────────
export interface AdherenceStats {
  total: number;
  taken: number;
  missed: number;
  adherenceRate: number;
}
