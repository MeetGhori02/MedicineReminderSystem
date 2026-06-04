# MediRemind Reminder System Architecture

## Overview
MediRemind uses a **hybrid notification system**: the backend runs scheduled checks via cron jobs, while the frontend handles actual user notifications through browser APIs and polling. This document details the complete reminder flow and notification mechanisms.

---

## 1. MEDICINE REMINDER DATA STRUCTURE

### Prisma Database Model (`schema.prisma`)
```prisma
model Medicine {
  id              Int           @id @default(autoincrement())
  userId          Int
  name            String        @db.VarChar(200)
  dosage          String        @db.VarChar(100)
  date            DateTime      @db.Date           // Scheduled date
  time            String        @db.VarChar(10)    // "HH:MM" format (e.g., "08:30")
  frequency       Frequency     @default(DAILY)    // ONCE, DAILY, WEEKLY
  beforeAfterFood FoodTiming    @default(AFTER)    // BEFORE, AFTER, WITH
  mealTimings     String?       @db.Text           // JSON: ["AFTER_BREAKFAST", "AFTER_LUNCH", "AFTER_DINNER"]
  notes           String?       @db.Text
  reminderEnabled Boolean       @default(true)     // Master toggle for reminders
  taken           Boolean       @default(false)    // Whether medicine was taken
  takenAt         DateTime?                        // When it was marked taken
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)
}

enum Frequency {
  ONCE
  DAILY
  WEEKLY
}

enum FoodTiming {
  BEFORE
  AFTER
  WITH
}
```

### Frontend Type Definition (`types/index.ts`)
```typescript
interface Medicine {
  id: number;
  userId: number;
  name: string;
  dosage: string;
  date: string;              // ISO string
  time: string;              // "HH:MM"
  frequency: Frequency;
  beforeAfterFood: FoodTiming;
  mealTimings: MealTiming[];  // Parsed from JSON
  notes: string | null;
  reminderEnabled: boolean;
  taken: boolean;
  takenAt: string | null;
  createdAt: string;
  updatedAt: string;
}
```

---

## 2. BACKEND REMINDER SCHEDULER

### Architecture: Cron-Based Server-Side Checks

**File:** `backend/src/services/reminderScheduler.ts`

#### Initialization
```typescript
export const startReminderScheduler = (): void => {
  // Run every minute to check for due medicines
  cron.schedule('* * * * *', async () => {
    await checkDueMedicines();
  });

  // Reset daily medicines at midnight
  cron.schedule('0 0 * * *', async () => {
    await resetDailyMedicines();
  });
};
```

**Where it starts:** `backend/src/main.ts` - called when server starts
```typescript
app.listen(PORT, () => {
  startReminderScheduler();  // ← Initializes cron jobs
  console.log('⏰ Reminder scheduler started');
});
```

#### Job 1: `checkDueMedicines()` - Runs Every Minute

**Logic:**
1. Gets current time in `HH:MM` format
2. Queries all medicines where:
   - `time` equals current `HH:MM` (e.g., "08:30")
   - `taken` is `false` (not yet marked as taken)
   - `reminderEnabled` is `true` (reminders enabled)
   - Date is today OR frequency is DAILY/WEEKLY
3. If matches found, logs to console with user details

**Query:**
```typescript
const dueMedicines = await prisma.medicine.findMany({
  where: {
    time: currentTime,              // Match current HH:MM
    taken: false,
    reminderEnabled: true,
    OR: [
      { date: { gte: today, lt: tomorrow } },  // Today's date
      { frequency: 'DAILY' },                  // or Daily medicines
    ],
  },
  include: {
    user: { select: { name: true, email: true } },
  },
});
```

**Output:** Console logs like:
```
⏰ [08:30] 2 medicine reminder(s) triggered:
  📋 John Doe (john@example.com): "Aspirin" 1 tablet
  📋 John Doe (john@example.com): "Vitamin D" 1 capsule
```

**Note:** Comments in code indicate this is where you'd implement:
- Email via SendGrid/Nodemailer
- Push notifications via Firebase/OneSignal
- SMS via Twilio

Currently, these are NOT implemented.

#### Job 2: `resetDailyMedicines()` - Runs at Midnight (00:00)

**Logic:**
1. Finds all medicines with `frequency: DAILY` where `taken: true`
2. Resets them: `taken = false`, `takenAt = null`
3. Logs count of reset medicines

**Query:**
```typescript
const result = await prisma.medicine.updateMany({
  where: { frequency: 'DAILY', taken: true },
  data: { taken: false, takenAt: null },
});
```

**Output:**
```
🔄 [MIDNIGHT] Reset 5 daily medicine(s) to "not taken"
```

#### Helper Function: `getUpcomingReminders(userId)`

Returns medicines due in the next 60 minutes. Currently not used in the main flow but available for future enhancements (e.g., showing upcoming reminders UI).

---

## 3. BACKEND-TO-FRONTEND NOTIFICATION FLOW

### Current Architecture: NO Real-Time Notifications

❌ **No WebSocket connection**
❌ **No Server-sent Events (SSE)**
❌ **No Push notifications**
❌ **No Email/SMS from backend**

### How Backend Informs Frontend

1. **Frontend polls the API** to get today's medicines:
   - Endpoint: `GET /api/medicines/today`
   - Called on dashboard load
   - Data includes `reminderEnabled` and `time` fields

2. **Frontend stores medicines in state** and runs local checks

3. **Frontend handles all notifications locally**

### Why This Design?
- Simpler to implement initially
- No external services needed (SendGrid, Firebase, etc.)
- Works immediately for users currently viewing the app
- Doesn't require WebSocket infrastructure

---

## 4. FRONTEND REMINDER DETECTION & NOTIFICATION

### Architecture: Client-Side Polling + Browser Notifications

**File:** `frontend/src/hooks/useReminders.ts`

#### Hook Installation
```typescript
const DashboardPage = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  
  // Initialize useReminders hook
  useReminders(medicines);
  
  return (/* UI */);
};
```

#### Functionality

**1. Request Notification Permission (on Mount)**
```typescript
useEffect(() => {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}, []);
```

**2. Check Every Minute for Due Medicines**
```typescript
useEffect(() => {
  const checkReminders = () => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${hh}:${mm}`;

    medicines.forEach((med) => {
      if (
        med.time === currentTime &&
        !med.taken &&
        med.reminderEnabled
      ) {
        showNotification(med);  // Trigger notification
      }
    });
  };

  const interval = setInterval(checkReminders, 60000);  // Every 60 seconds
  return () => clearInterval(interval);
}, [medicines, showNotification]);
```

**3. Show Browser Notification + Audio Alert**
```typescript
const showNotification = useCallback((medicine: Medicine) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  // Create native browser notification
  const notification = new Notification(`💊 Time for ${medicine.name}!`, {
    body: `Dosage: ${medicine.dosage} — ${medicine.beforeAfterFood} food`,
    icon: '/pill.svg',
    tag: `medicine-${medicine.id}`,      // Prevents duplicate notifications
    requireInteraction: true,             // Stays until user interacts
  });

  // Focus browser when user clicks notification
  notification.onclick = () => {
    window.focus();
    notification.close();
  };

  playAlert();  // Play beep sound
}, [playAlert]);
```

**4. Audio Alert (Beep Sound)**
```typescript
const playAlert = useCallback(() => {
  try {
    const ctx = new (window.AudioContext || webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);  // 880 Hz frequency
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);  // 0.5 second tone
  } catch {
    console.log('Audio not supported');
  }
}, []);
```

#### Notification Timing Diagram

```
12:30:00 → useReminders checks: No match
12:30:30 → useReminders checks: No match
...
12:34:00 → useReminders checks: No match
12:34:30 → useReminders checks: No match
   ↓
12:35:00 → useReminders checks: Medicine time matches "12:35"
   ↓
         ╭─→ Browser notification appears
         ├─→ Audio beep plays
         └─→ Toast notification (optional)
   ↓
User clicks notification or marks medicine taken
   ↓
PATCH /api/medicines/:id/taken endpoint called
   ↓
taken = true, takenAt = current timestamp
```

---

## 5. NOTIFICATION UI COMPONENTS

### 1. Browser Native Notifications
- **API:** [Notification API](https://developer.mozilla.org/en-US/docs/Web/API/Notification)
- **Trigger:** `useReminders` hook when time matches
- **Appearance:** System-level notification (OS-dependent)
- **Persistence:** Stays on screen until user interacts
- **Interaction:** Click to focus app window
- **Platform:** Desktop only; limited on mobile

### 2. React Hot Toast (App-Level Toasts)

**Installation:** `react-hot-toast` v2.4.1

**Initialization in App.tsx:**
```typescript
<Toaster
  position="top-center"
  toastOptions={{
    duration: 3000,
    style: {
      borderRadius: '12px',
      fontFamily: '"DM Sans", sans-serif',
      fontWeight: '500',
      fontSize: '13px',
      background: 'var(--bg-card)',
      color: 'var(--text-primary)',
      border: '1px solid rgba(16,185,129,0.2)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 16px rgba(16,185,129,0.1)',
    },
    success: { style: { borderColor: 'rgba(52,211,153,0.3)', color: 'var(--emerald)' } },
    error:   { style: { borderColor: 'rgba(255,77,109,0.3)', color: '#ff4d6d' } },
  }}
/>
```

**Usage Examples:**
```typescript
import toast from 'react-hot-toast';

// Success toast
toast.success('✅ Marked as taken');

// Error toast
toast.error('Failed to update');

// Info/default
toast('Notifications enabled');
```

**Where Used:**
- [LoginPage.tsx](LoginPage.tsx#L27): Login success/error
- [DashboardPage.tsx](DashboardPage.tsx#L177-188): Medicine action feedback
- [Layout.tsx](Layout.tsx#L41-65): Notification permission requests

**Note:** Toasts are for **API feedback and user actions**, not for medicine reminders (reminders use the Notification API instead).

### 3. Medicine Status UI

**File:** `frontend/src/pages/DashboardPage.tsx` - `TodayMedRow` component

**Status Badges:**
```
Pending  → 🟡 Yellow badge, amber alert color
Taken    → 🟢 Green badge, emerald color
Missed   → 🔴 Red badge, red alert color
```

**Status Logic:**
```typescript
const now = new Date();
const medicineTime = hh * 60 + mm;
const currentTime = now.getHours() * 60 + now.getMinutes();

const status = med.taken ? 'taken' 
  : currentTime > medicineTime ? 'missed' 
  : 'pending';
```

---

## 6. COMPLETE REMINDER FLOW SUMMARY

```
┌─────────────────────────────────────────────────────────────┐
│              MEDICINE REMINDER FLOW                         │
└─────────────────────────────────────────────────────────────┘

PHASE 1: SETUP
──────────────
1. User creates medicine with:
   - name: "Aspirin"
   - time: "08:30"
   - frequency: "DAILY"
   - reminderEnabled: true

2. Data stored in DB:
   Medicine {
     time: "08:30",
     reminderEnabled: true,
     taken: false
   }

PHASE 2: BACKEND MONITORING (Every Minute)
────────────────────────────────────────────
3. Server cron job runs (via node-cron):
   └─ checkDueMedicines()
   └─ Queries medicines where time = current HH:MM
   └─ Logs to console (NOT sent to frontend)

4. At 08:30, query finds Aspirin record

PHASE 3: FRONTEND DETECTION (Every 60 Seconds)
────────────────────────────────────────────────
5. useReminders hook runs periodic check
   └─ Loop through medicines loaded on dashboard
   └─ Compare medicine.time with current HH:MM

6. At 08:30, match found:
   └─ Check: time === "08:30" ✓
   └─ Check: taken === false ✓
   └─ Check: reminderEnabled === true ✓

PHASE 4: USER NOTIFICATION
────────────────────────────
7. Multiple notifications triggered:
   
   a) Browser Notification (System-level)
      ┌──────────────────────────────┐
      │ 💊 Time for Aspirin!         │
      │ Dosage: 1 tablet — AFTER food│
      │         [Close]              │
      └──────────────────────────────┘
      └─ Requires OS permission
      └─ Persistent until clicked
   
   b) Audio Alert
      └─ 880 Hz sine wave for 0.5 seconds
      └─ Plays regardless of notification permission
   
   c) Toast Notification (Optional)
      └─ App-level confirmation

PHASE 5: USER ACTION
─────────────────────
8. User clicks notification or app UI:
   └─ Clicks "Mark as Taken" button
   └─ Frontend calls: PATCH /api/medicines/{id}/taken
   └─ Request body: { taken: true }

9. Backend updates database:
   Medicine {
     taken: true,
     takenAt: 2024-03-18T08:30:45Z
   }

10. Dashboard updates UI:
    └─ Strike-through medicine name
    └─ Status changes to "✓ Taken"
    └─ Badge color changes to green

PHASE 6: DAILY RESET
─────────────────────
11. At midnight (00:00), cron job runs:
    └─ resetDailyMedicines()
    └─ For all DAILY medicines with taken=true:
       └─ Set taken = false
       └─ Set takenAt = null
    └─ Ready for next day cycle

12. Next day at 08:30 → PHASE 2 repeats
```

---

## 7. API ENDPOINTS

### Get Today's Medicines
```http
GET /api/medicines/today
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "...",
  "data": [
    {
      "id": 1,
      "name": "Aspirin",
      "dosage": "1 tablet",
      "date": "2024-03-18",
      "time": "08:30",
      "frequency": "DAILY",
      "reminderEnabled": true,
      "taken": false,
      "beforeAfterFood": "AFTER",
      "mealTimings": ["AFTER_BREAKFAST"]
    }
  ]
}
```

### Mark Medicine as Taken
```http
PATCH /api/medicines/:id/taken
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "taken": true
}

Response:
{
  "success": true,
  "message": "Medicine marked as taken ✅",
  "data": {
    "id": 1,
    "taken": true,
    "takenAt": "2024-03-18T08:30:45.123Z",
    ...
  }
}
```

### Get Upcoming Reminders (Available on Backend)
```typescript
// Not exposed via HTTP, but available for future use
const upcoming = await getUpcomingReminders(userId);
// Returns medicines due in next 60 minutes
```

---

## 8. CURRENT LIMITATIONS & FUTURE ENHANCEMENTS

### Current Limitations
1. ❌ **No real-time backend notifications** - Only console logging
2. ❌ **Frontend-only detection** - Misses alerts if user closes browser
3. ❌ **Mobile Web limitations** - Browser notifications limited on mobile
4. ❌ **No email/SMS** - No backend notification services configured
5. ❌ **Manual polling** - Checks only every 60 seconds (±60s delay)

### Suggested Enhancements
1. **WebSocket for Real-Time Notifications**
   - Server pushes when reminder is due
   - Instant notification vs. 60-second delay

2. **Email Reminders**
   - Integrate SendGrid/Nodemailer
   - Send reminder emails at scheduled time

3. **Push Notifications**
   - Firebase Cloud Messaging
   - Works even when browser closed (PWA)

4. **SMS Reminders**
   - Twilio integration
   - Fallback for users without email/app

5. **Mobile App**
   - React Native app
   - Native notification API access

6. **Advanced Scheduling**
   - Meal-time based reminders
   - Recurring patterns beyond daily/weekly

---

## 9. KEY FILES REFERENCE

| File | Purpose |
|------|---------|
| `backend/src/services/reminderScheduler.ts` | Cron jobs for server-side checks |
| `backend/src/services/medicineService.ts` | Medicine database operations |
| `backend/src/routes/medicines.ts` | API endpoints for medicines |
| `backend/src/main.ts` | Server startup (initializes scheduler) |
| `frontend/src/hooks/useReminders.ts` | Client-side reminder detection & notifications |
| `frontend/src/pages/DashboardPage.tsx` | Dashboard UI + medicine list |
| `frontend/src/services/api.ts` | HTTP client for API calls |
| `frontend/src/App.tsx` | App root (Toaster component setup) |
| `backend/prisma/schema.prisma` | Database schema definition |
| `frontend/src/types/index.ts` | TypeScript type definitions |

---

## 10. NOTIFICATION PERMISSION FLOW

```
┌─────────────────────────────────────────┐
│  User visits DashboardPage              │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│  useReminders hook mounts               │
│  Checks: Notification.permission        │
└──────────────┬──────────────────────────┘
               │
        ┌──────┴──────┬──────────────────┐
        ↓             ↓                  ↓
    'granted'    'denied'           'default'
        │             │                  │
        │             │      ┌───────────┘
        │             │      ↓
        │             │  Notification
        │             │  .requestPermission()
        │             │      │
        │     ┌───────┴──────┴─────┐
        │     ↓                    ↓
        │  Browser Prompt     Permission Denied
        │  "Allow/Block"           │
        │     │                    │
        ├─────┴────────────────────┤
        ↓
Can show browser notifications
(when medicine time matches)
```

---

## Summary Table

| Aspect | Technology | Status |
|--------|-----------|--------|
| **Server-Side Checks** | node-cron | ✅ Implemented |
| **Backend Notifications** | Email/SMS/Push | ❌ Not implemented |
| **Frontend Detection** | Client-side polling | ✅ Implemented |
| **Browser Notifications** | Notification API | ✅ Implemented |
| **Audio Alert** | Web Audio API | ✅ Implemented |
| **Toast Notifications** | react-hot-toast | ✅ Implemented |
| **Real-Time Push** | WebSocket/SSE | ❌ Not implemented |
| **Data Persistence** | MySQL + Prisma | ✅ Implemented |
| **Status Reset** | Midnight cron job | ✅ Implemented |

